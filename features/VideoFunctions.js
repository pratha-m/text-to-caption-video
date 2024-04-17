const fs =require("fs")
const tts=require("google-tts-api")
const {tweetHtmlGenerator}=require("../filesGenerators/tweetFileGenerator");
const nodeHtmlToImage=require("node-html-to-image")
const {exec}=require("child_process")
const path = require("path");
const {v4:uuidv4}=require("uuid");

const fileTypes={
    image:{
        folderPath:"tempFiles/images",
        prefix:"image",
        extension:".jpg",
    },
    audio:{
        folderPath:"tempFiles/audios",
        prefix:"audio",
        extension:".mp3"
    },
    video:{
        folderPath:"tempFiles/videos",
        prefix:"video",
        extension:".mp4"
    },
    text:{
        folderPath:"tempFiles/textFiles",
        prefix:"text",
        extension:".txt" 
    },
    merged_video:{
        folderPath:"tempFiles/mergedVideos",
        prefix:"merged-video",
        extension:".mp4"
    }   
}
const absolutePathGen=(folderStruct,fileName)=>{
    return path.join(process.cwd(),folderStruct,fileName)
}
const fileNameGenerator=(filePrefix)=>{
    const randStr=`-${Date.now()+Math.floor(Math.random()*1000)}-${uuidv4()}`;
    if(filePrefix===fileTypes.image.prefix) return filePrefix+randStr+fileTypes.image.extension; 
    else if(filePrefix===fileTypes.audio.prefix) return filePrefix+randStr+fileTypes.audio.extension; 
    else if(filePrefix===fileTypes.video.prefix) return filePrefix+randStr+fileTypes.video.extension; 
    else if(filePrefix===fileTypes.text.prefix) return filePrefix+randStr+fileTypes.text.extension; 
    else if(filePrefix===fileTypes.merged_video.prefix) return filePrefix+randStr+fileTypes.merged_video.extension; 
}
async function createFrame(textChunks,highlightInd) {
    try{
        let responseText="";
        for(let i=0;i<textChunks.length;i++){
            if(i==highlightInd) responseText+=` <span class='highlighted'>${textChunks[highlightInd]}</span>`
            else responseText+=" "+textChunks[i];
        }
        const {image}=fileTypes;

        const htmlText=tweetHtmlGenerator(responseText);
    
        const imageFileName=fileNameGenerator(image.prefix);
    
        const imageFilePath=absolutePathGen(image.folderPath,imageFileName);
    
        await nodeHtmlToImage({html:htmlText,output:imageFilePath})
    
        return {status:"success",message:"Finish creating Image",fileName:imageFileName}; 
    } catch (error) {
        return {status:"failed",message:"Error creating Image",error:error.message}; 
    }    
}
// Function to create voiceover (dummy example using FFmpeg)
async function createVoiceover(text,i) {
    try {
        const base64String = await tts.getAudioBase64(text, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        if (!base64String || base64String.length === 0) throw new Error('Audio buffer is empty');

        const {audio}=fileTypes;

        const audioBuffer = Buffer.from(base64String, 'base64');

        const audioFileName=fileNameGenerator(audio.prefix)

        const audioFilePath=absolutePathGen(audio.folderPath,audioFileName);
        
        await fs.promises.writeFile(audioFilePath,audioBuffer);

        return {status:"success",message:"Finish creating voice",fileName:audioFileName}; 
    } catch (error) {
        return {status:"failed",message:"Error creating voice",error:error.message}; 
    }
}
const createVideoFfmpeg=async(imageFileName,audioFileName,i)=>{
    const {video,image,audio}=fileTypes;

    const videoFileName=fileNameGenerator(video.prefix)

    const imagePath=absolutePathGen(image.folderPath,imageFileName);

    const audioPath=absolutePathGen(audio.folderPath,audioFileName)

    const outputVideoPath=absolutePathGen(video.folderPath,videoFileName);

    const command=`ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -vf "scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p" -shortest -movflags +faststart "${outputVideoPath}"`;

    return new Promise((resolve,reject)=>{
        exec(command,async(error,stdout,stderr)=>{
            if(error) reject();

            await fs.promises.unlink(audioPath); // Delete audio file

            await fs.promises.unlink(imagePath); // Delete image file

            resolve(videoFileName);
        })
    })
}
const mergeVideoFfmpeg=async(videoFileNames)=>{
    try{
        // -report--> this flag after the ffmpeg commands gievs a log file   
        const {text,video,merged_video}=fileTypes;

        const textFileName=fileNameGenerator(text.prefix)

        const textFilePath=absolutePathGen(text.folderPath,textFileName);

        const mergedVideoName=fileNameGenerator(merged_video.prefix);

        const mergeVideoPath=absolutePathGen(merged_video.folderPath,mergedVideoName);

        let fileContent="";

        videoFileNames.forEach((eachFile,index)=>{
            const outputVideoPath=absolutePathGen(video.folderPath,eachFile);
            const resString=`file '${outputVideoPath}'${index<videoFileNames.length-1?'\n':''}`
            fileContent+=resString;
        })

        await fs.promises.writeFile(textFilePath,fileContent);

        const mergeVideoCommand=`ffmpeg -f concat -safe 0 -i "${textFilePath}" -c:v copy "${mergeVideoPath}"`

        exec(mergeVideoCommand,async(error,stdout,stderr)=>{
            if(error){
                await fs.promises.unlink(textFilePath);

                throw new Error("Erorr In Executing Merging commadn"+error);
            }
            await fs.promises.unlink(textFilePath);

            await Promise.all(videoFileNames.map(async(eachFile,index)=>{
                const outputVideoPath=absolutePathGen(video.folderPath,eachFile);
                await fs.promises.unlink(outputVideoPath);
            }))

            return {status:"success",message:"videos merged successfully"}
        })
    }
    catch(error){
        return {status:"failed",message:"Erorr in creating merging videos",error:error.message}
    }
}
async function createVideo(inputText){
    try{
        const textChunks=inputText.split(" ");

        let videoFileNames=[];

        for(let i=0;i<textChunks.length;i++){
            const voiceFile=await createVoiceover(textChunks[i],i);

            const imageFile=await createFrame(textChunks,i);

            if(voiceFile.status==="success" && imageFile.status==="success"){
                const videoFileName=await createVideoFfmpeg(imageFile.fileName,voiceFile.fileName,i);

                if(!videoFileName) throw new Error("Error in Executing command")

                videoFileNames.push(videoFileName);
            }
            else throw new Error("Error in Creating image and audio");
        }
        const merge=await mergeVideoFfmpeg(videoFileNames);
        
        if(merge.status!=="success") throw new Error(merge.error);

        return {status:"success",message:"vidoe created successfully"}
    }
    catch(error){
        return {status:"failed",message:"Error in creating video",error:error.message}
    }
}

module.exports={createVideo};
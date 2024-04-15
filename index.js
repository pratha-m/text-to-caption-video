const express=require("express");
const app=express();
const { createCanvas, loadImage } = require('canvas');
const fs =require("fs")
const ffmpeg = require('fluent-ffmpeg');
const tts=require("google-tts-api")
const {makeHtmlText}=require("./files/htmlFile.js");
const nodeHtmlToImage=require("node-html-to-image")
const {spawn,exec}=require("child_process")
const path = require("path");
const videoshow=require("videoshow");

app.use(express.json());

// Function to create video frames with highlighted text
async function createFrame(textChunks,highlightInd) {
    try{

        let responseText="";
        for(let i=0;i<textChunks.length;i++){
            if(i==highlightInd) responseText+=` <span class='highlighted'>${textChunks[highlightInd]}</span>`
            else responseText+=" "+textChunks[i];
        }
        const htmlText=makeHtmlText(responseText);
    
        const imageFileName=`image${Date.now()}_${highlightInd}.jpg`
    
        const imageFilePath=path.join(process.cwd(),"images",imageFileName)
    
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

        const audioBuffer = Buffer.from(base64String, 'base64');

        const audioFileName=`audio${Date.now()}_${i}.mp3`

        const audioFilePath=path.join(process.cwd(),"audios",audioFileName);
        
        await fs.promises.writeFile(audioFilePath,audioBuffer);

        return {status:"success",message:"Finish creating voice",fileName:audioFileName}; 
    } catch (error) {
        return {status:"failed",message:"Error creating voice",error:error.message}; 
    }
}
async function createVideo(inputText){
    try{
        const textChunks=inputText.split(" ");
        for(let i=0;i<textChunks.length;i++){
            const voiceFile=await createVoiceover(textChunks[i],i);
            const imageFile=await createFrame(textChunks,i);
            if(voiceFile.status==="success" && imageFile.status==="success"){
                await imageVoiceToVideo(imageFile.fileName,voiceFile.fileName,i);   
                const outputVideoPath=path.join(process.cwd(),"output",`output${i}.mp4`);
                const outputImagePath=path.join(process.cwd(),"images",imageFile.fileName);
                const outputAudioPath=path.join(process.cwd(),"images",voiceFile.fileName);

                
            }
            else throw new Error("Error in Creatung image and audio");
        }
    }
    catch(error){
        console.log(error)
    }
}

const createVideoFfmpeg=async(imageFileName,audioFileName,i)=>{
    const videoFileName=`video_${Date.now()+Math.floor(Math.random()*10000)}_${i}.mp4`
    const imagePath=path.join(process.cwd(),"images",imageFileName);
    const audioPath=path.join(process.cwd(),"audios",audioFileName);
    const outputVideoPath=path.join(process.cwd(),"output",videoFileName);
    const command=`ffmpeg -loop 1 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -vf "scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p" -shortest -movflags +faststart "${outputVideoPath}"`;

    return new Promise((resolve,reject)=>{
        exec(command,(error,stdout,stderr)=>{
            if(error){
                // console.log(`error : ${error.message}`)
                reject(error);
                return ;
            }
            if(stderr){
                // console.log(`stderr : ${stderr}`)
                reject(stderr)
                return ;
            }
            // console.log(`stdout : ${stdout}`)
            resolve(stdout);
        })
    })
}
const main=async()=>{
    try {
        const result=await createVideoFfmpeg("img.jpg", "audio.mp3", 1);
        console.log("Success");
    } catch (error) {
        console.error("Error in generting video",error);
    }
}
// main()
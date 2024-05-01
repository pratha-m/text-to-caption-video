const dotenv=require("dotenv");
dotenv.config();
const express=require("express");
const { createEachFrameVideo, mergeVideoFfmpeg, fileTypes, absolutePathGen, createFrame, createVoiceover } = require("./features/VideoFunctions");
const fs =require("fs");
const app=express();
const cors=require("cors");


app.use(cors())
app.use(express.json());
    
app.get("/",(req,res)=>{
    res.send("Home");
})

app.post("/create-frame",async(req,res)=>{
    try{
        const data=await createFrame(["hello","world"],0);

        if(data.status!=="success") throw new Error(data.error);
        
        res.status(201).json({status:"success",imageFile:data.fileName})
    }
    catch(error){
        return res.status(501).json({status:"failed",message:"Error in creating Image",error:error.message})
    }
})
app.post("/create-audio",async(req,res)=>{
    try{
        const data=await createVoiceover("hello world",0);

        if(data.status!=="success") throw new Error(data.error);
        
        res.status(201).json({status:"success",imageFile:data.fileName})
    }
    catch(error){
        return res.status(501).json({status:"failed",message:"Error in creating Audio",error:error.message})
    }
})
app.post("/create-video",async(req,res)=>{
    try{
        const {tweet}=req.body; 

        const videos=await createEachFrameVideo(tweet);

        if(videos.status==="failed") throw new Error(videos.error);

        const merge=await mergeVideoFfmpeg(videos.videoFileNames);

        if(merge.status==="failed") throw new Error(merge.error);

        return res.status(201).json({status:"success",message:"Video Created Successfully",details:merge.fileName})
    }
    catch(error){
        return res.status(501).json({status:"failed",message:"Error in creating video",error:error.message})
    }
})
app.get("/render-video/:video_file",async(req,res)=>{
    try{
        const vidoFileName=req.params.video_file;
        const videoPath=absolutePathGen(fileTypes.merged_video.folderPath,vidoFileName)
        const range="Byes=0-";
        const videoSize=fs.statSync(videoPath).size;
        const chunkSize=1*1e6;
        const start = Number(range.replace(/\D/g, "")) 
        const end=Math.min(start+chunkSize,videoSize-1);
        const contentLength=end-start+1;
        const headers = { 
            "Content-Range": `bytes ${start}-${end}/${videoSize}`, 
            "Accept-Ranges": "bytes", 
            "Content-Length": contentLength, 
            "Content-Type": "video/mp4"
        } 
        res.writeHead(206,headers);
        const stream=fs.createReadStream(videoPath,{start,end});
        stream.pipe(res);           
    }
    catch(error){
        console.log(error)
        return res.status(501).json({status:"failed",message:"Error in Rendering video",error:error.message}); 
    }
})
app.listen(3001,()=>{
    console.log("Listening at PORT:3001")
})
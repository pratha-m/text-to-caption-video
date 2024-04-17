const express=require("express");
const { createVideo } = require("./features/VideoFunctions");
const app=express();

app.use(express.json());

app.post("/create-video",async(req,res)=>{
    try{
       const {tweet}=req.body; 

       await createVideo(tweet);

       return res.status(201).json({status:"success",message:"video created successfully"}); 
    }
    catch(error){
        return res.status(501).json({status:"success",message:"Error in creating video",error:error.message}); 
    }
})

app.listen(3001,()=>{
    console.log("Listening at PORT:3001")
})
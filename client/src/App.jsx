import { useState } from "react"
import "./App.css";
import axios from "axios";

const App = () => {
  const [videoUrl,setVideoUrl]=useState("");
  const [videoCreating,setVideoCreating]=useState(false);
  const [inpVal,setInpVal]=useState("");

  const createVideo=async(e)=>{
    try{
      e.preventDefault();
      setVideoCreating(true);
      const response=await axios.post("http://localhost:3001/create-video",{tweet:inpVal})
      
      if(response.status!=201) throw new Error("Error in Creating Video");

      setVideoUrl(`http://localhost:3001/render-video/${response.data.details}`); 

      setVideoCreating(false);
    }
    catch(error){
      setVideoCreating(false);
      console.log("Error in Creating Video");
    }
  }

  return (
    
    <form onSubmit={(e)=>{createVideo(e)}}>
      <div className="inpCont">
        <input type="text" onChange={(e)=>{setInpVal(e.target.value)}} required />
        <button>Create Video</button>
      </div>        
      <div id="vidContainer"> 
        { videoCreating && <span>Creating Video...</span> }
        { !videoCreating && !videoUrl && <span>Your Video Show Here</span>}
        { !videoCreating && videoUrl &&  <video src={videoUrl} controls></video>}
      </div>
    </form>
  )
}

export default App
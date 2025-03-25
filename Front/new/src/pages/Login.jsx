import React, {useEffect, useRef, useState} from "react";
import {Mail,Lock,Eye,EyeOff,Camera} from "lucide-react";
import {Link} from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";

const Login=() => {
  const navigate = useNavigate();
  const [formData,setFormData]=useState({
    Email: "",
    pwd: "",
    embeddings:[],
  });
  const videoref=useRef(null)
  const canvasref=useRef(null)
  const [showPassword,setShowPassword]=useState(false);
  const [cameraOpen,setCameraOpen]=useState(false);

  const captureimage=()=>{
    const video=videoref.current;
    const canvas=canvasref.current;
    const ctx=canvas.getContext("2d");

    canvas.width=video.videoWidth;
    canvas.height=video.videoHeight;

    ctx.drawImage(video,0,0,canvas.width,canvas.height)

    return canvas.toDataURL("image/jpg");
  }

  useEffect(()=>{
    if (cameraOpen && videoref.current) {
      navigator.mediaDevices
      .getUserMedia({video:true})
      .then ((stream) =>{
        videoref.current.srcObject=stream;
      })
      .catch((error)=>{
        toast.error("Camera access denied")
        setCameraOpen(false)
      })
    }
    else{
      if (videoref.current && videoref.current.srcObject) {
        videoref.current.srcObject.getTracks().forEach((track)=>track.stop());
        videoref.current.srcObject=null;
      }
    }
  },[cameraOpen])

  const handleFaceSubmit=async (e)=>{
    try{
      const image=await captureimage();
      if (!image) toast.error("Face not captured")
        const embed=await axios.post("http://localhost:5000/get-embedding",{image_url:image})
        // setFormData({...formData,embeddings:embed.data.embeddings})
        const extract=embed.data.embeddings;
        const updatedFormData={...formData,embeddings:extract};
        const res=await axios.post("http://localhost:5080/api/auth/login",updatedFormData,{withCredentials:true})
        if (res.status===200){
            toast.success("Login successfull!!")
        if (videoref.current && videoref.current.srcObject) {
            videoref.current.srcObject.getTracks().forEach((track) => track.stop());
            videoref.current.srcObject = null;
      }
      setCameraOpen(false);
      navigate("/home");
      return;
    }
    toast.error("Face not recognised")
  }
    catch(error){
      toast.error(error.response?.data?.message || "An error occurred. Please try again.")
    }
  }

  const handleSubmit=async (e)=>{
    e.preventDefault();
    try{
      const res=await axios.post("http://localhost:5080/api/auth/login",formData,{ withCredentials: true })
      toast.success("Login successfull!!")
      navigate("/home")
    }
    catch(error){
      toast.error(error.response?.data?.message || "An error occurred. Please try again.")
    }
  }
  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center p-6">
      <div className="bg-white shadow-lg p-8 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login to Your Account</h1>

        <form onSubmit={(e) =>handleSubmit(e)} className="space-y-4">

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md"
              value={formData.Email}
              onChange={(e) => setFormData({...formData,Email:e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-10 p-2 border border-gray-300 rounded-md"
              value={formData.pwd}
              onChange={(e) => setFormData({...formData,pwd:e.target.value})}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword?<EyeOff/>:<Eye/>}
            </button>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
            onClick={() => 
              {setCameraOpen(!cameraOpen)  
              }}
          >
            <Camera/> {cameraOpen?"Close Camera":"Login through camera"}
          </button>

          {cameraOpen && (
            <div className="w-full flex justify-center mt-4">
              <video ref={videoref} id="video" autoPlay className="rounded-md shadow-md"></video>
              <canvas ref={canvasref} style={{display:"none"}}/>
            </div>
          )}

          {cameraOpen && (
            <button
              type="button"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
              onClick={handleFaceSubmit}
            >
              Authenticate with Face
            </button>
            )}


          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Login
          </button>
        </form>

        <p className="text-gray-500 text-center mt-4">
          Don't have an account?
          <Link to="/" className="text-blue-500 hover:underline ml-1">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

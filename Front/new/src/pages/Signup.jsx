import React, {useState} from "react";
import {User,Mail,Lock,Eye,EyeOff,Upload} from "lucide-react";
import {Link} from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom"

const Signup = () => {
  const navigate = useNavigate();
  const [formData,setFormData]=useState({
    name:"",
    Email: "",
    pwd:"",
    profilephoto: null,
  });
  const [picname,setPicname]=useState("")
  const [showPassword,setShowPassword]=useState(false);

  const Handleimageupload=(e)=>{
    const file=e.target.files[0];
    if (!file) return;
    setPicname(file.name)
    const reader=new FileReader();
    reader.readAsDataURL(file)
    reader.onload=()=>{
      const base64image=reader.result;
      setFormData({...formData,profilephoto:base64image})
    }
  }

  const handleSubmit=async (e) => {
    e.preventDefault();

    try {
      const res=await axios.post("http://localhost:5080/api/auth/signup",formData,{ withCredentials: true })
      toast.success("Signup successfull!!")
      navigate("/home")
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };


  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center p-6">
      <div className="bg-white shadow-lg p-8 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Create an Account</h1>

        <form onSubmit={(e)=>handleSubmit(e)} className="space-y-4">
          
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md"
              value={formData.name}
              onChange={(e)=>setFormData({...formData,name:e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 p-2 border border-gray-300 rounded-md"
              value={formData.Email}
              onChange={(e)=>setFormData({...formData,Email:e.target.value})}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword?"text":"password"}
              placeholder="Password"
              className="w-full pl-10 pr-10 p-2 border border-gray-300 rounded-md"
              value={formData.pwd}
              onChange={(e)=>setFormData({ ...formData,pwd:e.target.value})}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={()=>setShowPassword(!showPassword)}
            >
              {showPassword?<EyeOff/>:<Eye/>}
            </button>
          </div>

          <div className="relative">
            <label className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
              <Upload className="text-gray-500" />
              <span className="text-gray-700">
                {formData.profilephoto?picname:"Upload Photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  Handleimageupload(e)
                }
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-gray-500 text-center mt-4">
          Already have an account?
          <Link to="/login" className="text-blue-500 hover:underline ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup

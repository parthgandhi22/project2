import express from "express"
import User from "../models/auth.js"
import { generateToken } from "../lib/token.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cloudinary from "../lib/cloudinary.js"
import axios from "axios"

const router=express.Router()
router.post("/signup",async (req,res)=>{
    const {name,pwd,Email,profilephoto}=req.body;
    try{
        if (!name || !pwd ||!Email)
            return res.status(400).json({message:"All fields required"})
        if (pwd.length<6)
            return res.status(400).json({message:"Password must be atleast 6 characters long"})
        const email=await User.findOne({email:Email})
        if (email) return res.status(400).json({message:"Email already exist"})
        const salt=await bcrypt.genSalt(10)
        const hashedpwd=await bcrypt.hash(pwd,salt);

        const pic=await cloudinary.uploader.upload(profilephoto,{transformation:[{width:500,height:500,crop:"fill"}],})

        const flaskResponse=await axios.post("http://localhost:5000/get-embedding",{image_url:pic.secure_url});
        if (flaskResponse.status!==200) {
            return res.status(400).json({message:"Face Embeddings Extraction Failed"});
        }

        const NewUser=new User({
            email:Email,
            name,
            pwd:hashedpwd,
            profilepic:pic.secure_url,
            embeddings: flaskResponse.data.embeddings,
        })

        if (NewUser){
            generateToken(NewUser._id,res);
            await NewUser.save();
            
            return res.status(200).json({
                fullName:NewUser.name,
                Email:NewUser.email,
            });
        }
        else{
            return res.status(400).json({message:"Invalid user data"})
        }
    }catch(error){
        return res.status(400).json({message:"Internal Server Error" + error.message});
    }
    
})
    router.post("/login",async (req,res)=>{
        function euiclideandistance(embedding1, embedding2) {
            let sum = 0;
            for (let i=0;i<embedding1.length;i++) {
                sum+=Math.pow(embedding1[i]-embedding2[i],2);
            }
            return Math.sqrt(sum);
        }
        const {pwd,Email,embeddings}=req.body;
        try{
            if (pwd){
            const user=await User.findOne({email:Email})
            if (!user) return res.status(400).json({message:"Entered email is incorrect"})
            const isMatch = await bcrypt.compare(pwd,user.pwd);
            if (!isMatch) return res.status(400).json({message:"Password incorrect"})
            generateToken(user._id,res);
            return res.status(200).json({
                fullName:user.name,
                Email:user.email,
            });}

            else if(embeddings){
                const allusers=await User.find();

                if (allusers.length===0) {
                    return res.status(400).json({message:"No users found"});
                }

                let user=null; 
                for (const iuser of allusers) {
                    const storedEmbedding=iuser.embeddings;
                    console.log("Stored ",storedEmbedding)
                    console.log("Input",embeddings)
                    const distance=euiclideandistance(storedEmbedding, embeddings);
                    console.log("Distance",distance)
                    if (distance < 0.5) {
                        user=iuser;
                        break; 
                    }
                }
                if (!user) return res.status(400).json({message:"Face not recognised"})
                generateToken(user._id,res);
                return res.status(200).json({
                    fullName:user.name,
                    Email:user.email,
                });
            }
        }
        catch(error){
            console.log("Error occured in login",error.message)
            return res.status(400).json({message:"Internal Server Error" + error.message});
        }
    })

router.post("/logout",(req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0})
        return res.status(200).json({message:"Logged out successfully"})
    } 
    catch(error){
        console.log("Error in logout:",error.message)
        return res.status(400).json({message:"Internal Server Error" + error.message});
    }
})

router.get("/user",async (req,res)=>{
    try {
        const token=req.cookies.jwt;
        if (!token) return res.status(401).json({message:"Unauthorized"});
    
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        const user=await User.findById(decoded.userId).select("-password")
        
         if (!user)
            return res.status(401).json({message:"User not found"})
        return res.status(200).json({name:user.name,email:user.email,profilepic:user.profilepic});
    }catch(error){
        res.status(401).json({message:"Internal error occurred "+error.message})
    }
})

export default router;
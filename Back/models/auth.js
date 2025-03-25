import mongoose from "mongoose";

const user=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true,
    },
    pwd:{
        type:String,
        required:true,
        minlength:6,
    },
    profilepic:{
        type:String,
        default:"",
    },
    embeddings:{
        type:[Number],
    }
},{timestamps:true})
const User =mongoose.model("user",user)
export default User
import express from "express"
import http from "http"
import userauth from "./Router/userauth.js"
import dotenv from "dotenv"
import { connectdb } from "./lib/db.js"
import cors from "cors"
import cookieParser from "cookie-parser"
dotenv.config()

const app=express()
app.use(cors({
    origin: "http://localhost:5176", 
    credentials: true,
}));
app.use(express.json({limit:"50mb"}));  // Increase JSON payload limit
app.use(express.urlencoded({limit:"50mb",extended:true}));

app.use(cookieParser())
app.use(express.json())
const server=http.createServer(app)
app.use("/api/auth",userauth)

const port=process.env.PORT
server.listen(port,()=>{
    console.log(`Server running on http://localhost:${port}`)
    connectdb();
})


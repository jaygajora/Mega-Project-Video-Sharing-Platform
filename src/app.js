import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});

import cookieParser from "cookie-parser";
import cors from "cors";

import express, { urlencoded } from "express";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",  // allow requests from this origin, you can also specify an array of origins
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],  // allow these HTTP methods
    credentials: true  // allow cookies to be sent with requests
}));  // this will enable CORS for all routes and origins, you can also configure it to allow specific origins and methods


app.use(express.json({limit: "16kb"}));  // this will allow us to parse JSON bodies in requests
app.use(express.static("public"));  // this will serve static files from the "public" directory
app.use(urlencoded({extended: true, limit: "16kb"}));  // this will allow us to parse URL-encoded bodies in requests, with a size limit of 16kb
app.use(cookieParser());  // this will allow us to parse cookies in requests


const port = process.env.PORT || 8080;

app.get(("/"), (req, res) => {
    res.send("Hello from Backend from out MEGA-APP!! 🚀🚀 (Express server)");
})

// importing routes
import userRouter from "./routes/user.routes.js";


// declaring routes
app.use("/api/v1/user", userRouter);   // once any user hites any route that starts with /api/v1/user, this will transfer the control to userRouter (router in the user.roytes.js file) and then the userRouter will handle the request and send the response back to the client, for example if the client hits /api/v1/user/register, this will transfer the control to userRouter and then userRouter will look for a route that matches /register and then it will execute the corresponding controller function and send the response back to the client
//http://localhost:8000/api/v1/user/register



// app.listen(port, () => {
//     console.log("Server running on port " + port)
// })

export {app};

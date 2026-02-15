// Method 1

// import dotenv from "dotenv";

// dotenv.config({
//     path: "./.env"
// });  // this is a very IMPORTANT STEP will load the environment variables from the .env file into process.env

// import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js";
// import express from "express";


// (async() => {
//     try{
//         const connectionInstance = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`);
//         console.log("Connected to database SUCESSFULLY!! 🚀🚀");
//         console.log(`DB Host : ${connectionInstance}`);
//     }
//     catch(error){
//         console.error("Connection to database FAILED :" + error);
//         process.exit(1);
//     }
// })();  // this is an IIFE (Immediately Invoked Function Expression) that executes immediately when the file is run


// Method 2

import connectToDB from "./db/index.js";

connectToDB();  // this will connect to the database before starting the server


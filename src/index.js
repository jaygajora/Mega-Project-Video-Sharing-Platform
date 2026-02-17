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
import {app} from "./app.js";  // this will import the express app from the app.js file

const port = process.env.PORT || 8080;

// Since connectToDB is an async function, so it will return a promise and we can use .then() and .catch() 
// to handle the promise returned by connectToDB()

connectToDB() // this will connect to the database before starting the server
.then(() => {

    const server = app.listen(port, () =>{
        console.log("Server running on port " + port + "...🚀🚀");
    })

    server.on("error", (error) => {
        console.error("Error starting the server: ", error);
        process.exit(1); // exit the process with a failure code
    })
    // start the server only after connecting to the database successfully
})
.catch((error) => {
    console.error("Failed to connect to the database. Server will not start. ERROR: ", error);
    process.exit(1); // exit the process with a failure code
})

// we will start the server in the app.js file after connecting to the database successfully


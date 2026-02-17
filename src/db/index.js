
import dotenv from "dotenv";
import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

dotenv.config({
    path: "./.env"
})

async function connectToDB(){
    try{
        const CoonectionInstance = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`);
        console.log("Connected to database SUCESSFULLY!! ✅");
        console.log(`DB Host : ${CoonectionInstance.connection.host}`);
    }

    catch(error){
        console.error("Connection to database FAILED :" + error);
        process.exit(1);
    }
}

export default connectToDB;
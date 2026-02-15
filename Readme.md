# This is a mega project where we are making a app like youtube
 npm i -D nodemon 
 npm i -D prettier
 This installs a development dependency and not just a dependency. The difference between the both is that dev dependecies do not go into production.

 Make .prettierrc and .prettierignore

 process.exit(0) -> exit without any kind of failure
 process.exit(1) -> exit with some failure
 [process.exit() with codes](https://www.geeksforgeeks.org/node-js/node-js-process-exit-method/) 


COMMON ERROR:
DONT FORGET TO import dotenv and then call its config method and provide path to the '.env' file
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});  // this is a very IMPORTANT STEP will load the environment variables from the .env file into process.env

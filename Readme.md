# This is a mega project where we are making a app like youtube
 npm i -D nodemon 
 npm i -D prettier
 This installs a development dependency and not just a dependency. The difference between the both is that dev dependecies do not go into production.

 Dependencies
 npm i mongoose
 npm i express
 npm i cookie-parser
 npm i cors
 npm i dot env

 We use middleswares and configuration settings with .use(), for example: app.use(cors());
 
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

Earlier we required middleware such as 'body-parser' to take data as an input but now express is able to di it on its own (by default)!


[Status codes](image.png)
This is why we use `this.success' = statusCode < 400 in the ApiResponse class because the status code from [400, 599] are for errors. (This is the standard practice). 
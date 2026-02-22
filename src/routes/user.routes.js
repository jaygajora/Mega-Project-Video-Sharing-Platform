import {Router} from "express";
import {registerUser} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();


router.route("/register").get((req, res) =>{
    res.send("Hello from the register route!! 🚀🚀 (GET request)");
});


router.route("/register").post(
    upload.fields([         // middleware to upload files to the server (local storage)
        {                   // write it before the controller function, to justify "jaane se pehele mujhse milkar jaana"
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverPhoto",
            maxCount: 1
        }
    ]),
    registerUser);   // this will handle the POST request to /api/v1/user/register and it will execute the registerUser controller function which is defined in the user.controller.js file, this function will handle the logic for registering a user and sending the response back to the client, we will implement this function in the user.controller.js file

export default router;   // since this has been exported as default, we can import it with any name in app.js, we will import it as userRouter in app.js and use it as a middleware for the /api/v1/users route, this way all the routes defined in this file will be prefixed with /api/v1/users, for example if we define a route for /register in this file, it will be accessible at /api/v1/users/register in the client side
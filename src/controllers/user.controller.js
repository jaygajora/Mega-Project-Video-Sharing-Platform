import { AsyncHandler } from "../utils/AsyncHandler.js";

const registerUser = AsyncHandler(async(req, res) => {
    res.status(200).json({
        message: "User registered successfully"
    })
})

export {registerUser}; 


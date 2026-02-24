import jwt from "jsonwebtoken";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";


// verifyJWT() is used to verify the ACCESS TOKEN and to add '.user' to the 'req'  
export const verifyJWT = AsyncHandler(async (req, _, next) => {    // '_' is an alternative to 'res' when we send no response. (It isused in production-grade settings)
    try {

        const accessToken = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        // req.header("Authorization")?.replace("Bearer ", ""); is for someone who do not have cookies like someone who has logged in using a mobile phone
    
        if(!accessToken){
            throw new ApiError(400, "Not authorized to make the logout request | Access Token NOT FOUND!!");
        }
    
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
        if(!decodedToken){
            throw  new ApiError(400, "Invalid Access Token");
        }
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(400, "Access Token is NOT VALID");
        }
    
        // const decodedRefreshToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        // if(!decodedRefreshToken){
        //     throw new ApiError(400, "Invalid Resfresh Token!!");
        // }
    
        // if(!(decodedRefreshToken === refreshTokenInDB)){
        //     throw new ApiError(400, "Resfresh Token authentication failed!!");
        // }
    
        req.user = user;
        return next();
    
        // return res
        // .status(200)
        // .ApiResponse(
        //     200,
        //     "User's JWT verified successfully",
        //     user
        // )
        // next
    } catch (error) {
        throw new ApiError(400, error?.message || "Something went wrong while verifying JWT Tokens");
    }
})
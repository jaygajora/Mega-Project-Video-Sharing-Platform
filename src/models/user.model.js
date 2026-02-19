import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true    // Add index for faster queries (this will make username field searchable)
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true, 
        trim: true,
        index: true
    },
    avatar: {
        type: String,    // cloudinary URL for the user's avatar image
        required: true
    },
    coverImage: {
        type: String,
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    }
    
}, {timestamps: true});


userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();   
    }

    this.password = await bcrypt.hash(this.password, 10);    // hash the password with a salt round of 10, the higher the salt round the more secure the password but it will also take more time to hash the password, so we will use 10 which is a good balance between security and performance
    next();                          // call the next middleware in the stack, in this case it will be the save method which will save the user to the database after hashing the password
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);  // this.password is the hashed password stored in the database and password is the plain text password entered by the user during login, bcrypt.compare will return true if they match and false if they don't
}

// JWT is a bearer token which means that the client needs to send it in the Authorization header of the request in the format "Bearer <token>" and the server will verify the token and if it's valid then it will allow the user to access the protected route, otherwise it will return an error response


//access token is not stored in the database because it is short lived and it is not needed to be stored in the database, it is only needed to be sent to the client and the client will store it in memory or in local storage and send it with every request to the server to access protected routes, 
// while refresh token is long lived and it is needed to be stored in the database because it is used to generate new access tokens when the access token expires, so we need to store it in the database to verify it when the client sends a request to refresh the access token

userSchema.methods.generateAcccessToken = function(){
    return jwt.sign(
        {
            _id : this.id,
            _username: this.username,
            _email: this.email,
            _fullName: this.fullName
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION
        }
    ) 
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRATION
        }
    )
}


export const User = mongoose.model("User", userSchema);
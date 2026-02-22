import multer from "multer";

const storage = multer.diskStorage({  // this is a configuration object for multer that specifies how and where to store the uploaded files
    destination: function(req, file, cb){   // this is a callback function that specifies the destination folder where the uploaded files will be stored in the local file system, we will use this folder to temporarily store the uploaded files before uploading them to cloudinary and then deleting them from the local file system
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb){       // name of the file in the local file system, this is the name that will be used to save the file in the local file system, we will use this name to upload the file to cloudinary and then delete it from the local file system                  
        cb(null, Date.now() + "-" + file.originalname)     // this will generate a unique filename for the uploaded file by appending the current timestamp to the original filename, this is to avoid filename conflicts in case multiple files with the same name are uploaded
    }
});


const upload = multer({storage: storage});      // this will create a multer instance with the specified storage configuration, we will use this instance as a middleware in our routes to handle file uploads, we can use it to handle single file uploads, multiple file uploads, or even file uploads with specific field names depending on our requirements

export default upload;
class ApiErrors extends Error{
    constructor(statuscode, message="Something went wrong", error=[], stack=""){
        super(message); // this will call the constructor of the parent class (Error) and set the message property
        this.message = message;
        this.statuscode = statuscode;
        this.error = error;
        this.data = null;  // this will hold any additional data that you want to send with the error response
        this.success = false;

        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor); // this will capture the stack trace and set it to the stack property
        }
    }
}


export {ApiErrors};
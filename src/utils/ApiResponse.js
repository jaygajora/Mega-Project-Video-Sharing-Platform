class ApiResponse {
    constructor(statusCode, message= "Success", data){  // this is the constructor of the ApiResponse class, it takes in three parameters: statusCode, message, and data. The message parameter has a default value of "Success".
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;  // this will set success to true if the status code is less than 400, otherwise it will be false;
    }

}

export { ApiResponse };

const AsyncHandler = (requestHandlerFunction) => {
    return (req, res, next) => {
        Promise.resolve(requestHandlerFunction(req, res, next)).catch(next);
    }
}

export {AsyncHandler};


// const AsyncHandler = (func) =>{   // this is a higher order function that takes in a function as a parameter and returns a new function that wraps the original function in a try-catch block. This is useful for handling errors in asynchronous functions, such as those that interact with a database or make API calls.
//     return async (req, res, next) => {
//         try{
//             await func(req, res, next);
//         }
//         catch(error){
//             return res.status(error.code || 500).json({
//                 success : false,
//                 message: error.message || "Something went wrong"
//             })
//         }
//     }
// }

// export {AsyncHandler};
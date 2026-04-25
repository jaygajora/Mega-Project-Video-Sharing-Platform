import { LeetCode } from "@leetnotion/leetcode-api";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const getUserLeetCodeProfile = AsyncHandler(async(req, res) => {
    const leetcode = new LeetCode();

    const user = await leetcode.user("jaygajora");

    if(!user){
        throw new ApiError(
            404,
            "No such User found!"
        )
    }

    const recentSubmissions = user.recentSubmissionList;

    for(var i = 0; i < recentSubmissions.length; i++){

        const timestampInString = (recentSubmissions[i].timestamp);
        const timeStamp = Number(timestampInString);
        const date = new Date(timeStamp * 1000);

        console.log(i + " - " + date);
    }

    // console.log(user);
    // console.log(recentSubmissions);
});


export { getUserLeetCodeProfile };
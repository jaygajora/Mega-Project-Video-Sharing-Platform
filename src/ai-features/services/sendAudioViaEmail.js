import { transporter } from "../../configs/nodemailer.config.js";
import fs from "fs";
import path from "path";

async function sendAudioViaEmail(to, subject, text, audioFilePath){
    
    if (!to) {
        throw new Error("Recipient email is required");
    }

    if (!audioFilePath || !fs.existsSync(audioFilePath)) {
        throw new Error("Audio file not found");
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            attachments: [
                {
                    filename: path.basename(audioFilePath),
                    path: audioFilePath
                }
            ]
        };

        const mail = await transporter.sendMail(mailOptions);
        return mail;
    } catch (error) {
        console.error("Error sending audio via email:", error);
        throw error;
    }       
}

export { sendAudioViaEmail };
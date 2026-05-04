<!-- # This is a mega project where we are making a app like youtube
 
 [Model](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)
 

 npm i -D nodemon 
 npm i -D prettier
 This installs a development dependency and not just a dependency. The difference between the both is that dev dependecies do not go into production.

 Dependencies
 npm i mongoose
 npm i express
 npm i cookie-parser
 npm i cors
 npm i dot env
 npm i bcrypt
 npm i jsonwebtoken
 npm i mongoose-aggregate-paginate-v2

 We use middleswares and configuration settings with .use(), for example: app.use(cors());
 
 Make .prettierrc and .prettierignore

 process.exit(0) -> exit without any kind of failure
 process.exit(1) -> exit with some failure
 [process.exit() with codes](https://www.geeksforgeeks.org/node-js/node-js-process-exit-method/) 


COMMON ERROR:
DONT FORGET TO import dotenv and then call its config method and provide path to the '.env' file
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});  // this is a very IMPORTANT STEP will load the environment variables from the .env file into process.env

Earlier we required middleware such as 'body-parser' to take data as an input but now express is able to di it on its own (by default)!


[Status codes](image.png)
This is why we use `this.success' = statusCode < 400 in the ApiResponse class because the status code from [400, 599] are for errors. (This is the standard practice). 


Whisper AI CLI: pip install -U openai-whisper

 -->

 # Distributed Video Sharing Platform with Multilingual AI Workflow
 
 A backend API for a YouTube-like video sharing platform built with **Node.js**, **Express**, **MongoDB**, **Cloudinary**, and a distributed **AI-powered multilingual audio workflow**. The system supports user authentication, video uploads, comments, likes, playlists, tweets/community posts, channel activity, and an asynchronous video-to-translated-audio pipeline using **BullMQ**, **Redis**, **FFmpeg**, **OpenAI Whisper**, **language detection**, **translation**, **text-to-speech**, and **email delivery**.
 
 ---
 
 ## Table of Contents
 
 - [Project Overview](#project-overview)
 - [Key Features](#key-features)
 - [Iteration 2: Multilingual AI Workflow](#iteration-2-multilingual-ai-workflow)
 - [Tech Stack](#tech-stack)
 - [System Architecture](#system-architecture)
 - [Project Structure](#project-structure)
 - [Database Models](#database-models)
 - [API Routes](#api-routes)
 - [Environment Variables](#environment-variables)
 - [Installation and Setup](#installation-and-setup)
 - [Running the Project](#running-the-project)
 - [AI Workflow Status Lifecycle](#ai-workflow-status-lifecycle)
 - [Important Implementation Concepts](#important-implementation-concepts)
 - [Known Notes / Improvements](#known-notes--improvements)
 - [Author](#author)
 
 ---
 
 ## Project Overview
 
 This project is a backend service for a distributed video sharing platform. Users can register, log in, upload videos with thumbnails, manage profile images, publish/unpublish videos, comment on videos, like videos/comments/tweets, create playlists, and view channel-specific content.
 
 The second major iteration adds an asynchronous multilingual AI pipeline. When a user requests transcription/translation for a video, the backend creates a transcription job and passes it through multiple Redis-backed queues and workers. Each worker performs one responsibility such as extracting audio, transcribing speech, detecting language, translating text, generating new speech, uploading generated audio, and sending the final audio through email.
 
 ---
 
 ## Key Features
 
 ### User Management
 
 - User registration with avatar and optional cover image upload.
 - User login using username/email and password.
 - Password hashing using `bcrypt`.
 - JWT-based authentication using access tokens and refresh tokens.
 - Secure logout by clearing refresh tokens.
 - Refresh access token flow.
 - Update user profile details.
 - Update avatar and cover image.
 - Change password and force reset password support.
 - Get logged-in user profile.
 - Get user watch history.
 
 ### Authentication and Authorization
 
 - Protected routes using custom `verifyJWT` middleware.
 - Access token read from cookies or `Authorization: Bearer <token>` header.
 - Refresh token stored in the database for validation.
 - HTTP-only secure cookies for token delivery.
 
 ### Video Management
 
 - Upload video file and thumbnail using `multer`.
 - Temporary local file storage before Cloudinary upload.
 - Upload video and image assets to Cloudinary.
 - Store video URL, thumbnail URL, duration, title, description, owner, views, and publish status in MongoDB.
 - Validate uploaded file type using Cloudinary resource type.
 - Reject videos shorter than 5 seconds.
 - Get video by ID.
 - Update video title, description, and thumbnail.
 - Delete video.
 - Toggle publish/unpublish status.
 
 ### Comments
 
 - Add comments to videos.
 - Get all comments under a video.
 - Update comments.
 - Delete comments.
 - Validate MongoDB ObjectIds before database operations.
 
 ### Likes
 
 - Toggle like/unlike for videos.
 - Toggle like/unlike for comments.
 - Toggle like/unlike for tweets.
 - Get all videos liked by the logged-in user.
 - Get all comments liked by the logged-in user.
 - Get all tweets liked by the logged-in user.
 
 ### Playlists
 
 - Create playlists.
 - Get playlist by ID.
 - Update playlist name and description.
 - Delete playlist.
 - Add videos to playlists.
 - Remove videos from playlists.
 - Get playlists created by a specific user.
 
 ### Tweets / Community Posts
 
 - Create short text posts.
 - Get tweets by username.
 - Update tweets.
 - Delete tweets.
 - Like/unlike tweets.
 
 ### Channel Features
 
 - Get videos uploaded by a channel/user.
 - Get playlists created by a user.
 - Get tweets created by a user.
 - Get comments created by a user.
 
 ### LeetCode Integration
 
 - Uses `@leetnotion/leetcode-api` to fetch LeetCode profile data.
 - Includes logic for reading recent submissions and converting timestamps to dates.
 
 ---
 
 ## Iteration 2: Multilingual AI Workflow
 
 Iteration 2 introduces a distributed AI workflow for processing videos into translated audio.
 
 ### High-Level Flow
 
 ```text
 User requests transcription for a video
         |
         v
 Create Transcription document in MongoDB
         |
         v
 Queue 1: Extract audio from video
         |
         v
 Queue 2: Transcribe audio to text
         |
         v
 Detect original language
         |
         v
 Queue 3: Translate transcript into target language
         |
         v
 Queue 4: Generate translated audio using text-to-speech
         |
         v
 Queue 5: Send translated audio through email
         |
         v
 Upload generated audio to Cloudinary and mark job completed
 ```
 
 ### AI Workflow Features
 
 - Video is downloaded from Cloudinary for processing.
 - Audio is extracted from video using `fluent-ffmpeg` and `ffmpeg-static`.
 - Extracted audio is uploaded to Cloudinary.
 - Audio is transcribed using OpenAI Whisper model `whisper-1`.
 - Original language is detected using `languagedetect`.
 - Transcript is translated using OpenAI chat completion.
 - Translated text is converted into speech using OpenAI TTS model `tts-1`.
 - Generated audio is emailed using Nodemailer.
 - Final translated audio is uploaded to Cloudinary.
 - Temporary local files are deleted after processing.
 - Job status and errors are tracked in MongoDB.
 - Queue retry support is configured with exponential backoff.
 
 ### Queues Used
 
 | Queue | Purpose |
 |---|---|
 | `extract-audio-queue` | Downloads video and extracts audio using FFmpeg |
 | `transcribe-queue` | Converts extracted audio into text using Whisper |
 | `translate-queue` | Translates transcript into target language |
 | `generate-auido-queue` | Generates translated audio using OpenAI TTS |
 | `send-audio-queue` | Emails generated audio and uploads it to Cloudinary |
 
 > Note: The queue name `generate-auido-queue` is spelled this way in the current codebase.
 
 ### Workers Used
 
 | Worker File | Responsibility |
 |---|---|
 | `extractAudio.worker.js` | Runs audio extraction jobs |
 | `transcribe.worker.js` | Runs transcription jobs |
 | `translate.worker.js` | Runs translation jobs |
 | `generateAudio.worker.js` | Runs audio generation jobs |
 | `sendAudioViaEmail.worker.js` | Runs email delivery jobs |
 
 The workers are imported in `src/index.js`, so they start when the server starts.
 
 ---
 
 ## Tech Stack
 
 ### Backend
 
 - Node.js
 - Express.js
 - MongoDB
 - Mongoose
 - Cookie Parser
 - CORS
 - dotenv
 
 ### Authentication and Security
 
 - JSON Web Tokens (`jsonwebtoken`)
 - bcrypt password hashing
 - HTTP-only cookies
 - Custom authentication middleware
 
 ### File Upload and Storage
 
 - Multer for multipart file uploads
 - Cloudinary for image, video, and audio storage
 - Local temporary storage under `public/temp` and `uploads/*`
 
 ### AI and Media Processing
 
 - OpenAI SDK
 - Whisper transcription model: `whisper-1`
 - Text-to-speech model: `tts-1`
 - OpenAI chat completion for translation
 - `languagedetect` for original language detection
 - `fluent-ffmpeg`
 - `ffmpeg-static`
 - `ffprobe-static`
 
 ### Distributed Jobs
 
 - BullMQ
 - Redis / IORedis
 - Queue-worker architecture
 - Retry and exponential backoff handling
 
 ### Email
 
 - Nodemailer
 - Gmail SMTP service
 
 ### Code Quality
 
 - Nodemon for development
 - Prettier configuration
 - Centralized API response/error utilities
 - Async error handling wrapper
 
 ---
 
 ## System Architecture
 
 ```text
 Client / Postman
       |
       v
 Express API Server
       |
       |-- Auth Middleware
       |-- Multer Upload Middleware
       |-- Controllers
       |
       v
 MongoDB <----------------------------+
       |                              |
       v                              |
 Cloudinary                           |
       |                              |
       v                              |
 Redis + BullMQ Queues                |
       |                              |
       v                              |
 Workers                              |
       |                              |
       |-- FFmpeg audio extraction     |
       |-- OpenAI Whisper              |
       |-- Language detection          |
       |-- OpenAI translation          |
       |-- OpenAI TTS                  |
       |-- Nodemailer email delivery   |
       |                              |
       +------ Update transcription status
 ```
 
 ---
 
 ## Project Structure
 
 ```text
 src/
 ├── ai-features/
 │   ├── jobs/
 │   │   ├── extractAudio.job.js
 │   │   ├── transcribe.job.js
 │   │   ├── translate.job.js
 │   │   ├── generateAudio.job.js
 │   │   └── sendAudioViaEmail.job.js
 │   ├── queues/
 │   │   ├── extractAudio.queue.js
 │   │   ├── transcribe.queue.js
 │   │   ├── translate.queue.js
 │   │   ├── generateAudio.queue.js
 │   │   └── sendAudioViaEmail.queue.js
 │   ├── services/
 │   │   ├── extractAudio.js
 │   │   ├── transcribeAudio.js
 │   │   ├── detectOriginalLanguage.js
 │   │   ├── textConversion.js
 │   │   ├── audioGeneration.js
 │   │   └── sendAudioViaEmail.js
 │   └── workers/
 │       ├── extractAudio.worker.js
 │       ├── transcribe.worker.js
 │       ├── translate.worker.js
 │       ├── generateAudio.worker.js
 │       └── sendAudioViaEmail.worker.js
 │
 ├── configs/
 │   ├── nodemailer.config.js
 │   ├── openai.config.js
 │   └── redis.config.js
 │
 ├── controllers/
 │   ├── user.controller.js
 │   ├── video.controller.js
 │   ├── transcription.controller.js
 │   ├── comment.controller.js
 │   ├── like.controller.js
 │   ├── playlist.controller.js
 │   ├── tweet.controller.js
 │   ├── channel.controller.js
 │   ├── leetcode.controller.js
 │   └── dashboard.controller.js
 │
 ├── db/
 │   └── index.js
 │
 ├── middlewares/
 │   ├── auth.middleware.js
 │   └── multer.middleware.js
 │
 ├── models/
 │   ├── user.model.js
 │   ├── video.model.js
 │   ├── comment.model.js
 │   ├── like.model.js
 │   ├── playlist.model.js
 │   ├── subscription.model.js
 │   ├── tweet.model.js
 │   └── transcription.model.js
 │
 ├── routes/
 │   ├── user.routes.js
 │   ├── video.route.js
 │   ├── comment.route.js
 │   ├── like.route.js
 │   ├── playlist.route.js
 │   ├── tweet.route.js
 │   ├── channel.route.js
 │   └── leetcode.routes.js
 │
 ├── utils/
 │   ├── ApiError.js
 │   ├── ApiResponse.js
 │   ├── AsyncHandler.js
 │   ├── cloudinary.js
 │   ├── deleteFile.js
 │   └── downloadFileFromCloudinary.js
 │
 ├── app.js
 ├── constants.js
 └── index.js
 ```
 
 ---
 
 ## Database Models
 
 ### User
 
 Stores platform user information.
 
 Main fields:
 
 - `username`
 - `email`
 - `fullName`
 - `avatar`
 - `coverImage`
 - `password`
 - `refreshToken`
 - `watchHistory`
 
 Concepts used:
 
 - Unique usernames and emails
 - Lowercase and trimmed fields
 - Password hashing using Mongoose pre-save middleware
 - Instance methods for access and refresh token generation
 - Password comparison method using bcrypt
 
 ### Video
 
 Stores uploaded video metadata.
 
 Main fields:
 
 - `videoFile`
 - `cloudinaryPublicId`
 - `thumbnail`
 - `owner`
 - `title`
 - `description`
 - `duration`
 - `views`
 - `isPublished`
 
 Concepts used:
 
 - Owner reference to `User`
 - Video and thumbnail Cloudinary URLs
 - Publish status toggle
 - Aggregate pagination plugin
 
 ### Comment
 
 Stores comments on videos.
 
 Main fields:
 
 - `content`
 - `video`
 - `owner`
 
 Concepts used:
 
 - References to `Video` and `User`
 - Timestamped comments
 - Aggregate pagination plugin
 
 ### Like
 
 Stores likes for different content types.
 
 Main fields:
 
 - `video`
 - `comment`
 - `tweet`
 - `likedBy`
 
 Concepts used:
 
 - One like model reused for videos, comments, and tweets
 - Toggle-like behavior by checking if an existing like exists
 
 ### Playlist
 
 Stores user-created playlists.
 
 Main fields:
 
 - `name`
 - `description`
 - `videos`
 - `owner`
 
 Concepts used:
 
 - Array of video references
 - Playlist ownership
 - Add/remove video operations
 
 ### Tweet
 
 Stores short community posts.
 
 Main fields:
 
 - `owner`
 - `content`
 
 Concepts used:
 
 - User-owned text posts
 - Like support through the shared `Like` model
 
 ### Subscription
 
 Stores user-channel subscription relationships.
 
 Main fields:
 
 - `channel`
 - `subscriber`
 
 ### Transcription
 
 Tracks the complete AI processing lifecycle.
 
 Main fields:
 
 - `video`
 - `originalLanguage`
 - `targetLanguage`
 - `extractedAudioPath`
 - `transcript`
 - `translatedTranscript`
 - `translatedAudioPath`
 - `status`
 - `error`
 - `jobId`
 
 Concepts used:
 
 - Queue status tracking
 - Error persistence
 - Reference to source video
 - Storage paths for extracted and generated audio
 
 ---
 
 ## API Routes
 
 Base URL:
 
 ```text
 http://localhost:8080/api/v1
 ```
 
 ### User Routes
 
 | Method | Endpoint | Protected | Description |
 |---|---|---:|---|
 | `POST` | `/user/register` | No | Register user with avatar and optional cover image |
 | `POST` | `/user/login` | No | Login user and issue tokens |
 | `POST` | `/user/logout` | Yes | Logout user |
 | `POST` | `/user/refreshTokens` | No | Refresh access and refresh tokens |
 | `POST` | `/user/updatePassword` | Yes | Update password |
 | `POST` | `/user/force-reset-password` | Yes | Force reset password |
 | `POST` | `/user/update-user-details` | Yes | Update profile details |
 | `GET` | `/user/profile` | Yes | Get logged-in user profile |
 | `POST` | `/user/update-avatar` | Yes | Upload and update avatar |
 | `POST` | `/user/update-cover-image` | Yes | Upload and update cover image |
 | `GET` | `/user/watchHistory` | Yes | Get watch history |
 
 ### Video Routes
 
 | Method | Endpoint | Protected | Description |
 |---|---|---:|---|
 | `GET` | `/video/` | No | Health/welcome response for video route |
 | `POST` | `/video/` | Yes | Upload a video and thumbnail |
 | `GET` | `/video/:videoId` | Yes | Get video by ID |
 | `PATCH` | `/video/:videoId` | Yes | Update video title, description, or thumbnail |
 | `DELETE` | `/video/:videoId` | Yes | Delete video |
 | `POST` | `/video/:videoId/toggle-publish-status` | Yes | Toggle video publish status |
 | `POST` | `/video/:videoId/transcribe` | Yes | Start multilingual AI transcription workflow |
 
 ### Comment Routes
 
 | Method | Endpoint | Protected | Description |
 |---|---|---:|---|
 | `GET` | `/comments/:videoId` | Yes | Get comments under a video |
 | `POST` | `/comments/:videoId` | Yes | Add comment to a video |
 | `PATCH` | `/comments/:commentId` | Yes | Update a comment |
 | `DELETE` | `/comments/:commentId` | Yes | Delete a comment |
 
 ### Like Routes
 
 | Method | Endpoint | Protected | Description |
 |---|---|---:|---|
 | `POST` | `/like/toggle/v/:videoId` | Yes | Like/unlike a video |
 | `POST` | `/like/toggle/c/:commentId` | Yes | Like/unlike a comment |
 | `POST` | `/like/toggle/t/:tweetId` | Yes | Like/unlike a tweet |
 | `GET` | `/like/videos` | Yes | Get liked videos |
 | `GET` | `/like/comments` | Yes | Get liked comments |
 | `GET` | `/like/tweets` | Yes | Get liked tweets |
 
 ### Playlist Routes
 
 | Method | Endpoint | Protected | Description |
 |---|---|---:|---|
 | `POST` | `/playlist/` | Yes | Create playlist |
 | `GET` | `/playlist/:playlistId` | Yes | Get playlist by ID |
 | `PATCH` | `/playlist/:playlistId` | Yes | Update playlist |
 | `DELETE` | `/playlist/:playlistId` | Yes | Delete playlist |
 | `POST` | `/playlist/add/:videoId/:playlistId` | Yes | Add video to playlist |
 | `POST` | `/playlist/remove/:videoId/:playlistId` | Yes | Remove video from playlist |
 | `GET` | `/playlist/user/:username` | Yes | Get playlists by username |
 
 ### Tweet Routes
 
 | Method | Endpoint | Protected | Description |
 |---|---|---:|---|
 | `POST` | `/tweets/` | Yes | Create tweet/community post |
 | `GET` | `/tweets/:username` | Yes | Get tweets by username |
 | `PATCH` | `/tweets/:tweetId` | Yes | Update tweet |
 | `DELETE` | `/tweets/:tweetId` | Yes | Delete tweet |
 
 ### Channel Routes
 
 | Method | Endpoint | Protected | Description |
 |---|---|---:|---|
 | `GET` | `/channel/:username/videos` | Yes | Get videos uploaded by user |
 | `GET` | `/channel/:username/playlists` | Yes | Get playlists by user |
 | `GET` | `/channel/:username/tweets` | Yes | Get tweets by user |
 | `GET` | `/channel/:username/comments` | Yes | Get comments by user |
 
 <!-- ### LeetCode Route
 
 | Method | Endpoint | Protected | Description |
 |---|---|---:|---|
 | `GET` | `/leetcode/:username` | No | Fetch LeetCode user profile/submission data |
 
 --- -->
 
 ## Environment Variables
 
 Create a `.env` file in the project root.
 
 ```env
 PORT=8080
 CORS_ORIGIN=*
 
 DB_URL=mongodb://127.0.0.1:27017
 
 ACCESS_TOKEN_SECRET=your_access_token_secret
 ACCESS_TOKEN_EXPIRATION=1d
 REFRESH_TOKEN_SECRET=your_refresh_token_secret
 REFRESH_TOKEN_EXPIRATION=10d
 
 CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
 CLOUDINARY_API_KEY=your_cloudinary_api_key
 CLOUDINARY_API_SECRET=your_cloudinary_api_secret
 
 OPENAI_API_KEY=your_openai_api_key
 
 REDIS_HOST=redis://localhost:6379
 
 EMAIL_USER=your_email@gmail.com
 EMAIL_PASSWORD=your_gmail_app_password
 ```
 
 ### Notes
 
 - `DB_URL` is combined with the database name from `src/constants.js`, which is `videotubeDB`.
 - Use a Gmail App Password for `EMAIL_PASSWORD` instead of your normal Gmail password.
 - Redis must be running before the queue workers can process jobs.
 - Cloudinary credentials are required for video, image, and audio uploads.
 - OpenAI API key is required for transcription, translation, and audio generation.
 
 ---
 
 ## Installation and Setup
 
 ### 1. Clone the Repository
 
 ```bash
 git clone https://github.com/<username>/<repo-name>.git
 cd <repo-name>
 ```
 
 ### 2. Install Dependencies
 
 ```bash
 npm install
 ```
 
 ### 3. Create `.env`
 
 Create the `.env` file using the example shown above.
 
 ### 4. Start MongoDB
 
 Run MongoDB locally or provide a MongoDB Atlas connection string in `DB_URL`.
 
 ### 5. Start Redis
 
 If Redis is installed locally:
 
 ```bash
 redis-server
 ```
 
 If using Docker:
 
 ```bash
 docker run --name redis-video-platform -p 6379:6379 -d redis
 ```
 
 ### 6. Run the Server
 
 ```bash
 npm run dev
 ```
 
 Server starts on:
 
 ```text
 http://localhost:8080
 ```
 
 ---
 
 ## Running the Project
 
 ### Development Mode
 
 ```bash
 npm run dev
 ```
 
 This runs:
 
 ```bash
 nodemon src/index.js
 ```
 
 ### Root Health Check
 
 ```text
 GET /
 ```
 
 Response:
 
 ```text
 Hello from Backend from out MEGA-APP!! 🚀🚀 (Express server)
 ```
 
 ---
 
 ## AI Workflow Status Lifecycle
 
 The `Transcription` model uses the following statuses:
 
 | Status | Meaning |
 |---|---|
 | `QUEUED` | Job has been created and added to the first queue |
 | `PROCESSING` | Worker has started processing |
 | `AUDIO_EXTRACTED` | Audio was extracted from the video |
 | `TRANSCRIBING` | Audio is being converted to text |
 | `TRANSCRIBED` | Audio transcription completed |
 | `TRANSLATING` | Transcript is being translated |
 | `TRANSLATED` | Translation completed |
 | `LANGUAGE_DETECTED` | Original language detected |
 | `GENERATING_AUDIO` | Translated audio is being generated |
 | `AUDIO_GENERATED` | Translated audio file generated locally |
 | `SENDING_AUDIO` | Email delivery is in progress |
 | `COMPLETED` | Workflow finished successfully |
 | `FAILED` | Workflow failed and error message is saved |
 
 ---
 
 ## Important Implementation Concepts
 
 ### 1. MVC-Style Backend Structure
 
 The project separates responsibilities into routes, controllers, models, middlewares, utilities, services, jobs, queues, and workers.
 
 ### 2. Custom Async Error Handling
 
 `AsyncHandler` wraps async route handlers and forwards errors to Express instead of repeating `try/catch` logic everywhere.
 
 ### 3. Standardized API Responses
 
 `ApiResponse` creates a consistent success response structure with:
 
 - `statusCode`
 - `message`
 - `data`
 - `success`
 
 `ApiError` creates a consistent error object with:
 
 - `statusCode`
 - `message`
 - `error`
 - `success`
 
 ### 4. JWT Authentication
 
 The app uses short-lived access tokens and longer-lived refresh tokens. Access tokens protect secure routes, while refresh tokens allow users to request new access tokens.
 
 ### 5. File Upload Flow
 
 ```text
 Multer stores file locally
         |
         v
 Cloudinary uploads file
         |
         v
 MongoDB stores Cloudinary URL
         |
         v
 Local file is deleted
 ```
 
 ### 6. Queue-Based Distributed Processing
 
 The AI workflow is split into independent jobs. This avoids blocking the main HTTP request and makes the system more scalable.
 
 ### 7. Worker Failure Handling
 
 Workers listen for failure events and update the `Transcription` document with:
 
 - `status: FAILED`
 - error message
 
 ### 8. Retry with Exponential Backoff
 
 Jobs are configured with retry attempts and exponential backoff to handle temporary failures from external services like OpenAI, Cloudinary, Redis, or email.
 
 ### 9. Temporary File Cleanup
 
 Downloaded videos, extracted audio, and generated audio files are deleted after they are uploaded or processed to avoid unnecessary local storage usage.
 
 ### 10. Cloudinary as Central Media Storage
 
 Cloudinary stores:
 
 - User avatars
 - User cover images
 - Video files
 - Thumbnails
 - Extracted audio
 - Final translated audio
<!--  
 --- -->
 
 <!-- ## Known Notes / Improvements
 
 These are useful points for future iterations:
 
 - `dashboard.controller.js` appears incomplete.
 - `getJobStatus` exists in `transcription.controller.js`, but there is no route currently registered for checking transcription status directly.
 - `detectLanguage.queue.js` and `detectLanguage.job.js` files are present but currently empty.
 - The queue name `generate-auido-queue` contains a typo and should ideally be renamed to `generate-audio-queue` consistently.
 - `Video` model requires `cloudinaryPublicId`, but the current video creation logic stores `videoFile` and `thumbnail` URLs and does not set `cloudinaryPublicId`. This should be fixed before production use.
 - The email sending job currently uses a hardcoded recipient email in `sendAudioViaEmail.job.js`; it should use the video owner's email dynamically.
 - Add a centralized Express error-handling middleware for cleaner API error responses.
 - Add role-based access checks so only owners can update/delete their own videos, comments, tweets, and playlists.
 - Add pagination for videos, comments, playlists, and channel pages.
 - Add automated tests for controllers, services, and queue jobs.
 - Add API documentation using Swagger/OpenAPI. -->
 
 ---
 
 ## Author
 
 **Jay Gajora**
 
 ---

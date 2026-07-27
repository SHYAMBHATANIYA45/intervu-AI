import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { analyzeResume, finishInterview, generateQuestion, getMyInterviewReport, getMyInterviews, submitAnswer } from "../controllers/interview.controller.js";
const interviewRouter = express.Router();

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume);

//step1 me fetch krenge 
interviewRouter.post("/generate-questions", isAuth, generateQuestion);

//step 2 me fetch krenge
interviewRouter.post('/submit-answer', isAuth, submitAnswer);
interviewRouter.post('/finish', isAuth, finishInterview);

interviewRouter.get("/getInterview", isAuth, getMyInterviews);
interviewRouter.get("/report/:id", isAuth, getMyInterviewReport)

export default interviewRouter;
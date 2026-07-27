import express from "express";
// import { auth } from "../../frontend/src/utils/firebase";
import { googleAuth, logOut } from "../controllers/auth.controller.js";
export const authRouter = express.Router();
authRouter.post('/google',googleAuth);
authRouter.get('/logout',logOut);
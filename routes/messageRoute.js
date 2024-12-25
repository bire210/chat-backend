import express from 'express';
import { allMessageOfAchat, sendMessage } from '../controllers/messageContoller.js';
import { authMiddleware } from '../middleware/userAuthMiddleware.js';

const messageRouter=express.Router();
messageRouter.get("/:id",authMiddleware,allMessageOfAchat);
messageRouter.post("/send",authMiddleware,sendMessage);

export {messageRouter}
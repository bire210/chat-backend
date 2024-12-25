

import {prisma} from '../dataBase/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const allMessageOfAchat=async(req,res)=>{
    try {
      const chatId=+req.params.id;
      if(!chatId){
        throw new ApiError(400,"Please send Id");
      }
      const messages = await prisma.message.findMany({
        where: {
          chatId: chatId,
        },
        include: {
          sender: {
            select: {
              id:true,
              name: true,
              email: true,
              image: true,
            },
          },
          chat: {
            include: {
              latestMessage: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // 'asc' for ascending or 'desc' for descending
        },
      });
      
      res.status(200).json(new ApiResponse(200,messages,"all messages"));
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.error || 'Internal Server Error'));
    }
  }

  const sendMessage = async (req, res) => {
    try {
      const { content, chatId } = req.body;
  
      if (!content || !chatId) {
        throw new ApiError(400, "Please provide the chat Id and message content");
      }
  
      const newMessage = {
        senderId: req.user.id,
        content: content,
        chatId: chatId
      };
  
      const message = await prisma.message.create({
        data: newMessage,
        include: {
          sender: {
            select: {
              name: true,
              image: true,
              email: true
            }
          },
          chat: {
            include: {
              users: {
                select: {
                  name: true,
                  email: true,
                  image: true
                }
              }
            }
          }
        }
      });
  
      await prisma.chat.update({
        data: {
          latestMessageId: message.id
        },
        where: {
          id: chatId
        }
      });
  
      res.status(201).json(new ApiResponse(201, message, "Message sent"));
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.error || 'Internal Server Error'));
    }
  };
  

  export {allMessageOfAchat,sendMessage}
import jwt from "jsonwebtoken";
import {prisma} from "../dataBase/prisma.js";
import { ApiError } from "../utils/apiError.js";

const authMiddleware=async(req,res,next)=>{
    try {
       const authHeaders=req.headers.authorization;
       if(!authHeaders){
        res.satus(401).json(new ApiError(401,"not authorized"))
       } 
      const token=authHeaders.split(" ")[1];
      const decodedData= jwt.verify(token,process.env.SECRET_KEY); 
      // console.log("decoded user data",decodedData)
      const user=await prisma.user.findFirst({
        where:{
            email:decodedData
        }
      });

      // console.log("user inside middleware",user)
      req.user=user;
      next()
    } catch (error) {
        res.status(500).json(new ApiError(500,error.message));
    }
}

export {authMiddleware}
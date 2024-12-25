import cluster from "cluster";
import os from "os";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { prisma } from "./dataBase/prisma.js";
import { userRouter } from "./routes/userRoute.js";
import { Server } from "socket.io";

import { ApiError } from "./utils/apiError.js";
import { chatRouter } from "./routes/chatRoute.js";
import { messageRouter } from "./routes/messageRoute.js";
dotenv.config();

const numberOfCPU = os.availableParallelism();

if (cluster.isPrimary) {
  for (let i = 0; i < numberOfCPU; ++i) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin:["*","http://localhost:5173", "https://chat-app-nu-brown.vercel.app"]
    })
  );
  app.get("/", (req, res) => {
    res.status(200).json({
      status: 200,
      message: `Response by: ${process.pid}`,
    });
  });

  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/chat", chatRouter);
  app.use("/api/v1/message", messageRouter);

  app.use("/*", (req, res) => {
    res.status(404).json(new ApiError(404, "Route Not Found"));
  });

  const PORT = process.env.PORT || 8000;
  const server = app.listen(PORT, async () => {
    try {
      await prisma.$connect();
      console.log(`Server is running over ${PORT}`);
    } catch (error) {
      console.log(`Database is not connected`, error.message);
      process.exit(0);
    }
  });

  const io = new Server(server, {
    cors: {
      origin: ["*","http://localhost:5173", "https://chat-app-nu-brown.vercel.app"], // Replace with your client's URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected to socket.io", socket.id);
    socket.on("setup", (userData) => {
      console.log("Setup user:", userData);
      socket.join(userData.id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    socket.on("new message", (newMessageRecieved) => {
      console.log("newMessageRecieved", newMessageRecieved);
      let chat = newMessageRecieved.chat;
      socket.join(newMessageRecieved.chatId)
      // io.in(newMessageRecieved.chatId).emit("message recieved", newMessageRecieved);
      socket.emit("message recieved", newMessageRecieved);
      socket.broadcast.to(newMessageRecieved.chatId).emit("message recieved", newMessageRecieved)

    });

    socket.on("typing",({chatId,name})=>{
      console.log(chatId,name);
      socket.join(chatId);
      socket.broadcast.to(chatId).emit("typing",name);
    })

    socket.on("disconnect", () => {
      console.log("Disconnected", socket.id);
    });
  });
}

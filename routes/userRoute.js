import exprss from "express";
import { getAllFriends, login, register, search } from "../controllers/userContoller.js";
import { authMiddleware } from "../middleware/userAuthMiddleware.js";

const userRouter=exprss.Router();
userRouter.post("/sign-up",register)
userRouter.post("/login",login)
userRouter.get("/find-friend",search)
userRouter.get("/friends",authMiddleware,getAllFriends)


export {userRouter}
import {Router} from "express";
import {upload} from "../middlewares/upload";
import {getAllUsers, getLoggedInUser, login, signUp} from "../controllers/authController";
import {verifyToken} from "../middlewares/verifyAccessToken";
import {authenticateToken} from "../middlewares/authenticateToken";
const userRouter =  Router();

userRouter.post("/signup", upload.single("profileImage"), signUp);
userRouter.get("/", getAllUsers)
userRouter.post("/login", login)
userRouter.get("/get", verifyToken, getLoggedInUser)
userRouter.get("/access", authenticateToken,getAllUsers)
export default userRouter;
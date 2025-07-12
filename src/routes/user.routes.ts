import {Router} from "express";
import {upload} from "../middlewares/upload";
import {getAllUsers, login, signUp} from "../controllers/authController";

const userRouter =  Router();

userRouter.post("/signup", upload.single("profileImage"), signUp);
userRouter.get("/", getAllUsers)
userRouter.post("/login", login)
export default userRouter;
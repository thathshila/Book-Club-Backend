import {Router} from "express";
import {upload} from "../middlewares/upload";
import {deleteUser, getAllUsers, getLoggedInUser, login, logout, signUp} from "../controllers/authController";
import {authorizeRoles, verifyToken} from "../middlewares/verifyAccessToken";
import {authenticateToken} from "../middlewares/authenticateToken";
const userRouter =  Router();

userRouter.post("/signup", upload.single("profileImage"), signUp);
userRouter.get("/", getAllUsers)
userRouter.post("/login", login)
userRouter.post("/logout", logout)
userRouter.get("/get", verifyToken,authorizeRoles("reader"), getLoggedInUser)
userRouter.get("/access", authenticateToken,getLoggedInUser)
userRouter.get("/get", verifyToken,authorizeRoles("reader"), getLoggedInUser)
userRouter.delete("/:id", authenticateToken, authorizeRoles("librarian"),deleteUser);
export default userRouter;
import {Router} from "express";


import {
    deleteUser,
    getAllReaders, getAllStaff,
    getAllUsers,
    getLoggedInUser,
    login,
    logout,
    signUp, updateUser, updateUserRole
} from "../controllers/authController";
import {authorizeRoles, verifyToken} from "../middlewares/verifyAccessToken";
import {authenticateToken} from "../middlewares/authenticateToken";
import multer from "multer";
import {upload} from "../middlewares/upload";
const userRouter =  Router();

userRouter.post("/signup", upload.single("profileImage"), signUp);
userRouter.get("/", getAllUsers)
userRouter.post("/login", login)
userRouter.post("/logout", logout)
userRouter.get("/get", verifyToken,authorizeRoles("reader"), getLoggedInUser)
userRouter.get("/access", authenticateToken,getLoggedInUser)
userRouter.get("/get", verifyToken,authorizeRoles("reader"), getLoggedInUser)
userRouter.delete("/:id", authenticateToken, authorizeRoles("librarian"),deleteUser);
userRouter.get("/readers", authenticateToken, authorizeRoles("staff", "librarian"), getAllReaders);
userRouter.get("/staff", authenticateToken, authorizeRoles("staff", "librarian"), getAllStaff);
userRouter.put("/update/:id", authenticateToken,upload.single("profileImage"), authorizeRoles("admin", "librarian"), updateUser);
userRouter.put("/role/:id", authenticateToken, authorizeRoles("librarian"), updateUserRole);
export default userRouter;
import {Router} from "express";


import {
    deleteUser, forgotPassword,
    getAllStaff,
    getAllUsers,
    getLoggedInUser,
    login,
    logout, refreshToken, resetPassword,
    signUp, updateUser, updateUserRole, verifyOtp
} from "../controllers/authController";
import {authorizeRoles, verifyToken} from "../middlewares/verifyAccessToken";
import {authenticateToken} from "../middlewares/authenticateToken";
import {upload} from "../middlewares/upload";
const userRouter =  Router();

userRouter.post("/signup", upload.single("profileImage"), signUp);
userRouter.get("/", getAllUsers)
userRouter.post("/login", login)
userRouter.post("/logout", logout)
userRouter.post("/refresh-token", refreshToken);
userRouter.get("/get", verifyToken,authorizeRoles("staff", "librarian"), getLoggedInUser)
userRouter.get("/access", authenticateToken,getLoggedInUser)
userRouter.delete("/:id", authenticateToken, authorizeRoles("librarian"),deleteUser);
userRouter.get("/staff", authenticateToken, authorizeRoles("librarian"), getAllStaff);
userRouter.put("/update/:id", authenticateToken,upload.single("profileImage"),authorizeRoles("staff","librarian"), updateUser);
userRouter.put("/role/:id", authenticateToken, authorizeRoles("librarian"), updateUserRole);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/reset-password", resetPassword);
export default userRouter;
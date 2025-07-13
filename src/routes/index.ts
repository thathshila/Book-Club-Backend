import {Router} from "express";
import userRouter from "./user.routes";
import bookRouter from "./book.routes";

const rootRouter = Router();

rootRouter.use("/auth", userRouter)
rootRouter.use("/books", bookRouter);
export default rootRouter;
import {Router} from "express";
import userRouter from "./user.routes";
import bookRouter from "./book.routes";
import lendingRouter from "./lending.routes";

const rootRouter = Router();

rootRouter.use("/auth", userRouter)
rootRouter.use("/books", bookRouter);
rootRouter.use("/lendings", lendingRouter)
export default rootRouter;
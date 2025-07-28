import {Router} from "express";
import userRouter from "./user.routes";
import bookRouter from "./book.routes";
import lendingRouter from "./lending.routes";
import readerRouter from "./reader.routes";
import notificationRouter from "./notification.routes";
import auditRouter from "./audit.routes";
import dashboardRouter from "./dashboard.routes";


const rootRouter = Router();

rootRouter.use("/auth", userRouter)
rootRouter.use("/books", bookRouter);
rootRouter.use("/lendings", lendingRouter)
rootRouter.use("/reader", readerRouter)
rootRouter.use("/notifications", notificationRouter)
rootRouter.use("/audit", auditRouter)
rootRouter.use("/dashboard", dashboardRouter)
export default rootRouter;
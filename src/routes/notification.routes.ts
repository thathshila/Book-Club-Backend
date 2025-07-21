import express from "express";
import { sendOverdueNotifications } from "../controllers/notificationController";

const notificationRouter = express.Router();

notificationRouter.post("/send-overdue-notifications", sendOverdueNotifications);

export default notificationRouter;

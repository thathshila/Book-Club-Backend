import express from "express";
import {
    getAllReaders,
    addReader,
    updateReader,
    deleteReader, getAllReadersFilter,
} from "../controllers/readerController";
import {authorizeRoles, verifyToken} from "../middlewares/verifyAccessToken";

const readerRouter = express.Router();

readerRouter.get("/",verifyToken, authorizeRoles("staff", "librarian"), getAllReaders);
readerRouter.post("/",verifyToken, authorizeRoles("staff", "librarian"), addReader);
readerRouter.put("/:id", verifyToken, authorizeRoles("staff", "librarian"),updateReader);
readerRouter.delete("/:id",verifyToken, authorizeRoles("staff", "librarian"), deleteReader);
readerRouter.get("/filter",verifyToken, authorizeRoles("staff", "librarian"), getAllReadersFilter);

export default readerRouter;

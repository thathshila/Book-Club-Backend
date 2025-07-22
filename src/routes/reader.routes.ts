import express from "express";
import {
    getAllReaders,
    addReader,
    updateReader,
    deleteReader, getAllReadersFilter,
} from "../controllers/readerController";

const readerRouter = express.Router();

readerRouter.get("/", getAllReaders);
readerRouter.post("/", addReader);
readerRouter.put("/:id", updateReader);
readerRouter.delete("/:id", deleteReader);
readerRouter.get("/filter", getAllReadersFilter);

export default readerRouter;

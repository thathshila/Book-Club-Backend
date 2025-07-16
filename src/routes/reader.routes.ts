import express from "express";
import {
    getAllReaders,
    addReader,
    updateReader,
    deleteReader,
} from "../controllers/readerController";

const router = express.Router();

router.get("/", getAllReaders);
router.post("/", addReader);
router.put("/:id", updateReader);
router.delete("/:id", deleteReader);

export default router;

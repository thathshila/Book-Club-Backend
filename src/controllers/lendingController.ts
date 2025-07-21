
import { Request, Response, NextFunction } from "express";
import { LendingModel } from "../models/Lending";
import { BookModel } from "../models/Book";
import { ApiErrors } from "../errors/ApiErrors";
import { updateOverdueStatuses } from "../utils/updateOverdueStatus";
import {ReaderModel} from "../models/Reader";

// Lend a book using memberId and ISBN
export const lendBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { memberId, isbn, dueDate } = req.body;

        if (!memberId || !isbn || !dueDate) {
            throw new ApiErrors(400, "memberId, isbn, and dueDate are required");
        }

        const reader = await ReaderModel.findOne({ memberId });
        if (!reader) throw new ApiErrors(404, "Reader not found");

        const book = await BookModel.findOne({ isbn });
        if (!book) throw new ApiErrors(404, "Book not found");

        if (book.copiesAvailable < 1) {
            throw new ApiErrors(400, "No copies available for lending");
        }

        const lending = new LendingModel({
            book: book._id,
            reader: reader._id,
            dueDate,
        });

        await lending.save();

        book.copiesAvailable -= 1;
        await book.save();

        res.status(201).json({
            message: "Book lent successfully",
            lending,
        });
    } catch (err) {
        next(err);
    }
};

// View lending history by book or reader
export const getLendingHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateOverdueStatuses(); // Update overdue statuses before fetching

        const { bookId, readerId } = req.query;
        const filter: any = {};
        if (bookId) filter.book = bookId;
        if (readerId) filter.reader = readerId;

        const lendings = await LendingModel.find(filter)
            .populate("book", "title author isbn")
            .populate("reader", "name email");

        res.status(200).json(lendings);
    } catch (err) {
        next(err);
    }
};

// Mark book as returned
export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lendingId = req.params.id;

        const lending = await LendingModel.findById(lendingId).populate("book");
        if (!lending) throw new ApiErrors(404, "Lending record not found");

        if (lending.status === "returned") {
            return res.status(400).json({ message: "Book already returned" });
        }

        lending.status = "returned";
        lending.returnDate = new Date();
        await lending.save();

        const book = await BookModel.findById(lending.book._id);
        if (book) {
            book.copiesAvailable += 1;
            await book.save();
        }

        res.status(200).json({
            message: "Book returned successfully",
            lending,
        });
    } catch (err) {
        next(err);
    }
};

// Get overdue lendings (for overdue management page and notifications)
export const getOverdueLendings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateOverdueStatuses(); // Ensure overdue statuses are up-to-date

        const overdueLendings = await LendingModel.find({ status: "overdue" })
            .populate("book", "title author isbn")
            .populate("reader", "name email");

        res.status(200).json(overdueLendings);
    } catch (err) {
        next(err);
    }
};

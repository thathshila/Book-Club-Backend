//
// import { Request, Response, NextFunction } from "express";
// import { LendingModel } from "../models/Lending";
// import { BookModel } from "../models/Book";
// import { ApiErrors } from "../errors/ApiErrors";
// import { updateOverdueStatuses } from "../utils/updateOverdueStatus";
// import {ReaderModel} from "../models/Reader";
// import jwt from "jsonwebtoken";
//
//
//     const getUserFromToken = (req: Request) => {
//         const authHeader = req.headers["authorization"];
//         const token = authHeader && authHeader.split(" ")[1];
//         if (!token) throw new ApiErrors(401, "Unauthorized: No token");
//         const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
//         return { userId: decoded.userId, role: decoded.role, name: decoded.name };
// };
//
// /**
//  * 📌 Lend a book using memberId and ISBN
//  * POST /api/lendings
//  */
// export const lendBook = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { memberId, isbn, dueDate } = req.body;
//
//         if (!memberId || !isbn) {
//             throw new ApiErrors(400, "memberId and isbn are required");
//         }
//
//         const { name } = getUserFromToken(req);
//         const calculatedDueDate = dueDate
//             ? new Date(dueDate)
//             : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // default 14 days
//
//         const reader = await ReaderModel.findOne({ memberId });
//         if (!reader) throw new ApiErrors(404, "Reader not found");
//
//         const book = await BookModel.findOne({ isbn });
//         if (!book) throw new ApiErrors(404, "Book not found");
//
//         if (book.copiesAvailable <= 0) {
//             throw new ApiErrors(400, "No copies available for lending");
//         }
//
//         const lending = new LendingModel({
//             book: book._id,
//             reader: reader._id,
//             dueDate: calculatedDueDate,
//             createdBy: name,
//         });
//
//         await lending.save();
//
//         book.copiesAvailable = Math.max(book.copiesAvailable - 1, 0);
//         await book.save();
//
//         res.status(201).json({
//             message: "Book lent successfully",
//             lending,
//         });
//     } catch (err) {
//         next(err);
//     }
// };
//
// // View lending history by book or reader
// export const getLendingHistory = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         await updateOverdueStatuses(); // Update overdue statuses before fetching
//
//         const { bookId, readerId } = req.query;
//         const filter: any = {};
//         if (bookId) filter.book = bookId;
//         if (readerId) filter.reader = readerId;
//
//         const lendings = await LendingModel.find(filter)
//             .populate("book", "title author isbn")
//             .populate("reader", "name email");
//
//         res.status(200).json(lendings);
//     } catch (err) {
//         next(err);
//     }
// };
//
// // Mark book as returned
// export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const lendingId = req.params.id;
//
//         const lending = await LendingModel.findById(lendingId).populate("book");
//         if (!lending) throw new ApiErrors(404, "Lending record not found");
//
//         if (lending.status === "returned") {
//             return res.status(400).json({ message: "Book already returned" });
//         }
//
//         lending.status = "returned";
//         lending.returnDate = new Date();
//         await lending.save();
//
//         const book = await BookModel.findById(lending.book._id);
//         if (book) {
//             book.copiesAvailable += 1;
//             await book.save();
//         }
//
//         res.status(200).json({
//             message: "Book returned successfully",
//             lending,
//         });
//     } catch (err) {
//         next(err);
//     }
// };
//
// // Get overdue lendings (for overdue management page and notifications)
// export const getOverdueLendings = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         await updateOverdueStatuses(); // Ensure overdue statuses are up-to-date
//
//         const overdueLendings = await LendingModel.find({ status: "overdue" })
//             .populate("book", "title author isbn")
//             .populate("reader", "name email");
//
//         res.status(200).json(overdueLendings);
//     } catch (err) {
//         next(err);
//     }
// };
//
// // Calculate overdue payments for all overdue books
// export const calculateOverduePayments = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         await updateOverdueStatuses(); // Ensure overdue statuses are up to date
//
//         const overdueLendings = await LendingModel.find({ status: "overdue" })
//             .populate("book", "title author isbn")
//             .populate("reader", "name email");
//
//         const results = overdueLendings.map(lending => {
//             const today = new Date();
//             const dueDate = new Date(lending.dueDate);
//             const daysOverdue = Math.max(
//                 Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
//                 0
//             );
//
//             const finePerDay = 10; // Adjust fine per day as needed
//             const totalFine = daysOverdue * finePerDay;
//
//             return {
//                 lendingId: lending._id,
//                 book: lending.book,
//                 reader: lending.reader,
//                 dueDate: lending.dueDate,
//                 daysOverdue,
//                 finePerDay,
//                 totalFine,
//             };
//         });
//
//         res.status(200).json(results);
//     } catch (err) {
//         next(err);
//     }
// };


import { Request, Response, NextFunction } from "express";
import { LendingModel } from "../models/Lending";
import {Book, BookModel} from "../models/Book";
import {Reader, ReaderModel} from "../models/Reader";
import { ApiErrors } from "../errors/ApiErrors";
import { updateOverdueStatuses } from "../utils/updateOverdueStatus";
import jwt from "jsonwebtoken";
import { AuditLogModel } from "../models/AuditLog";

// 🔐 Extract user from JWT
const getUserFromToken = (req: Request) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw new ApiErrors(401, "Unauthorized: No token");
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
    return { userId: decoded.userId, role: decoded.role, name: decoded.name };
};

// 📋 Log audit activity
const logAudit = async (
    action: "CREATE" | "UPDATE" | "DELETE" | "LEND" | "RETURN" | "LOGIN" | "OTHER",
    performedBy: string,
    entityType: string,
    entityId: string,
    details?: string
) => {
    await AuditLogModel.create({
        action,
        performedBy,
        entityType,
        entityId,
        details,
    });
};

/**
 * 📌 Lend a book using memberId and ISBN
 * POST /api/lendings
 */
export const lendBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { memberId, isbn, dueDate } = req.body;

        if (!memberId || !isbn) {
            throw new ApiErrors(400, "memberId and isbn are required");
        }

        const { name } = getUserFromToken(req);
        const calculatedDueDate = dueDate
            ? new Date(dueDate)
            : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // default 14 days

        const reader = await ReaderModel.findOne({ memberId });
        if (!reader) throw new ApiErrors(404, "Reader not found");

        const book = await BookModel.findOne({ isbn });
        if (!book) throw new ApiErrors(404, "Book not found");

        if (book.copiesAvailable <= 0) {
            throw new ApiErrors(400, "No copies available for lending");
        }

        const lending = new LendingModel({
            book: book._id,
            reader: reader._id,
            dueDate: calculatedDueDate,
            createdBy: name,
        });

        await lending.save();

        book.copiesAvailable = Math.max(book.copiesAvailable - 1, 0);
        await book.save();

        // 📝 Log audit
        await logAudit("LEND", name, "Lending", lending._id.toString(), `Lent book '${book.title}' to '${reader.name}'`);

        res.status(201).json({
            message: "Book lent successfully",
            lending,
        });
    } catch (err) {
        next(err);
    }
};

// 📚 View lending history by book or reader
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
export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: lendingId } = req.params; // ✅ from URL params
        const { name } = getUserFromToken(req); // ✅ from JWT

        const lending = await LendingModel.findById(lendingId)
            .populate("book")
            .populate("reader");

        if (!lending) {
            throw new ApiErrors(404, "Lending record not found");
        }

        if (lending.status === "returned") {
            throw new ApiErrors(400, "Book already returned");
        }

        lending.returnDate = new Date();
        lending.status = "returned";

        await lending.save();

        const book = lending.book as Book;
        const reader = lending.reader as Reader;

        await logAudit(
            "RETURN",
            name,
            "Lending",
            lending._id.toString(),
            `Returned book '${book.title}' from '${reader.name}'`
        );

        res.status(200).json({ message: "Book returned successfully", lending });
    } catch (error) {
        next(error);
    }
};

// 🚨 Get overdue lendings
export const getOverdueLendings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateOverdueStatuses();

        const overdueLendings = await LendingModel.find({ status: "overdue" })
            .populate("book", "title author isbn")
            .populate("reader", "name email");

        res.status(200).json(overdueLendings);
    } catch (err) {
        next(err);
    }
};

// 💸 Calculate overdue payments
export const calculateOverduePayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateOverdueStatuses();

        const overdueLendings = await LendingModel.find({ status: "overdue" })
            .populate("book", "title author isbn")
            .populate("reader", "name email");

        const results = overdueLendings.map(lending => {
            const today = new Date();
            const dueDate = new Date(lending.dueDate);
            const daysOverdue = Math.max(
                Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
                0
            );

            const finePerDay = 10; // You can change this value
            const totalFine = daysOverdue * finePerDay;

            return {
                lendingId: lending._id,
                book: lending.book,
                reader: lending.reader,
                dueDate: lending.dueDate,
                daysOverdue,
                finePerDay,
                totalFine,
            };
        });

        res.status(200).json(results);
    } catch (err) {
        next(err);
    }
};

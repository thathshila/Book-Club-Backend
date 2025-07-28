// import { Request, Response, NextFunction } from "express";
// import { BookModel } from "../models/Book";
// import {ApiErrors} from "../errors/ApiErrors";
//
// export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const books = await BookModel.find({ isDelete: false }); // ✅ filter non-deleted
//         res.status(200).json(books);
//     } catch (error) {
//         next(error);
//     }
// };
//
// export const addBook = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         console.log("req.body:", req.body);
//         console.log("req.file:", req.file);
//
//         // Generate random ISBN
//         const isbn = generateISBN();
//
//         const bookData = {
//             ...req.body,
//             isbn, // auto-generated
//             profileImage: req.file?.path // Cloudinary URL
//         };
//
//         const book = new BookModel(bookData);
//         await book.save();
//
//         res.status(201).json(book);
//     } catch (error: any) {
//         console.error(error);
//         res.status(500).json({ message: error.message, stack: error.stack });
//     }
// };
//
// // Place outside the controller
// function generateISBN() {
//     return String(Math.floor(1000000000000 + Math.random() * 9000000000000));
// }
//
//
// export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const bookId = req.params.id;
//         const {
//             title,
//             author,
//             publishedDate,
//             genre,
//             description,
//             copiesAvailable,
//         } = req.body;
//
//         const profileImage = req.file?.path;
//
//         // Ensure copiesAvailable is a number if sent
//         const copiesAvailableNumber = copiesAvailable !== undefined ? Number(copiesAvailable) : undefined;
//
//         const updatedBook = await BookModel.findOneAndUpdate(
//             { _id: bookId, isDelete: false }, // ✅ corrected field
//             {
//                 ...(title && { title }),
//                 ...(author && { author }),
//                 ...(publishedDate && { publishedDate }),
//                 ...(genre && { genre }),
//                 ...(description && { description }),
//                 ...(copiesAvailableNumber !== undefined && { copiesAvailable: copiesAvailableNumber }),
//                 ...(profileImage && { profileImage }),
//             },
//             { new: true }
//         );
//
//         if (!updatedBook) throw new ApiErrors(404, "Book not found");
//
//         res.status(200).json({
//             message: "Book updated successfully",
//             book: updatedBook,
//         });
//     } catch (err) {
//         next(err);
//     }
// };
//
// export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const deletedBook = await BookModel.findByIdAndUpdate(
//             req.params.id,
//             { isDelete: true },
//             { new: true }
//         );
//         if (!deletedBook) {
//             return res.status(404).json({ message: "Book not found" });
//         }
//         res.status(200).json({ message: "Book soft-deleted successfully", book: deletedBook });
//     } catch (error) {
//         next(error);
//     }
// };
//
// export const getAllBooksFilter = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { title, author, genre, isbn } = req.query;
//
//         const filter: any = { isDelete: false };
//
//         if (title) filter.title = { $regex: title, $options: "i" };
//         if (author) filter.author = { $regex: author, $options: "i" };
//         if (genre) filter.genre = { $regex: genre, $options: "i" };
//         if (isbn) filter.isbn = { $regex: isbn, $options: "i" };
//
//         const books = await BookModel.find(filter);
//
//         res.status(200).json(books);
//     } catch (error) {
//         next(error);
//     }
// };
//
import { Request, Response, NextFunction } from "express";
import { BookModel } from "../models/Book";
import { ApiErrors } from "../errors/ApiErrors";
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

// 📌 Get all non-deleted books
export const getAllBooks = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const books = await BookModel.find({ isDelete: false });
        res.status(200).json(books);
    } catch (error) {
        next(error);
    }
};

// 📌 Add new book
export const addBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);

        const isbn = generateISBN();
        const bookData = {
            ...req.body,
            isbn,
            profileImage: req.file?.path,
            createdBy: name,
            createdAt: new Date(),
        };

        const book = new BookModel(bookData);
        await book.save();

        await logAudit("CREATE", name, "Book", book._id.toString(), `Book '${book.title}' created`);

        res.status(201).json({ message: "Book added", book });
    } catch (error: any) {
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

// Generate random ISBN
function generateISBN() {
    return String(Math.floor(1000000000000 + Math.random() * 9000000000000));
}

// 📌 Update book
export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const bookId = req.params.id;
        const {
            title,
            author,
            publishedDate,
            genre,
            description,
            copiesAvailable,
        } = req.body;

        const profileImage = req.file?.path;
        const copiesAvailableNumber = copiesAvailable !== undefined ? Number(copiesAvailable) : undefined;

        const updateData = {
            ...(title && { title }),
            ...(author && { author }),
            ...(publishedDate && { publishedDate }),
            ...(genre && { genre }),
            ...(description && { description }),
            ...(copiesAvailableNumber !== undefined && { copiesAvailable: copiesAvailableNumber }),
            ...(profileImage && { profileImage }),
            updatedBy: name,
            updatedAt: new Date(),
        };

        const updatedBook = await BookModel.findOneAndUpdate(
            { _id: bookId, isDelete: false },
            updateData,
            { new: true }
        );

        if (!updatedBook) throw new ApiErrors(404, "Book not found");

        await logAudit("UPDATE", name, "Book", updatedBook._id.toString(), `Book '${updatedBook.title}' updated`);

        res.status(200).json({ message: "Book updated", book: updatedBook });
    } catch (err) {
        next(err);
    }
};

// 📌 Soft delete book
export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const bookId = req.params.id;

        const deletedBook = await BookModel.findByIdAndUpdate(
            bookId,
            { isDelete: true, deletedBy: name, deletedAt: new Date() },
            { new: true }
        );

        if (!deletedBook) throw new ApiErrors(404, "Book not found");

        await logAudit("DELETE", name, "Book", deletedBook._id.toString(), `Book '${deletedBook.title}' soft deleted`);

        res.status(200).json({ message: "Book soft deleted", book: deletedBook });
    } catch (err) {
        next(err);
    }
};

// 📌 Filter books
export const getAllBooksFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, author, genre, isbn } = req.query;
        const filter: any = { isDelete: false };

        if (title) filter.title = { $regex: title, $options: "i" };
        if (author) filter.author = { $regex: author, $options: "i" };
        if (genre) filter.genre = { $regex: genre, $options: "i" };
        if (isbn) filter.isbn = { $regex: isbn, $options: "i" };

        const books = await BookModel.find(filter);
        res.status(200).json(books);
    } catch (error) {
        next(error);
    }
};

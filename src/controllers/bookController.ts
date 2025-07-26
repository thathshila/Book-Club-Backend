import { Request, Response, NextFunction } from "express";
import { BookModel } from "../models/Book";
import {ApiErrors} from "../errors/ApiErrors";

export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const books = await BookModel.find({ isDelete: false }); // ✅ filter non-deleted
        res.status(200).json(books);
    } catch (error) {
        next(error);
    }
};

export const addBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);

        // Generate random ISBN
        const isbn = generateISBN();

        const bookData = {
            ...req.body,
            isbn, // auto-generated
            profileImage: req.file?.path // Cloudinary URL
        };

        const book = new BookModel(bookData);
        await book.save();

        res.status(201).json(book);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

// Place outside the controller
function generateISBN() {
    return String(Math.floor(1000000000000 + Math.random() * 9000000000000));
}


export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
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

        // Ensure copiesAvailable is a number if sent
        const copiesAvailableNumber = copiesAvailable !== undefined ? Number(copiesAvailable) : undefined;

        const updatedBook = await BookModel.findOneAndUpdate(
            { _id: bookId, isDelete: false }, // ✅ corrected field
            {
                ...(title && { title }),
                ...(author && { author }),
                ...(publishedDate && { publishedDate }),
                ...(genre && { genre }),
                ...(description && { description }),
                ...(copiesAvailableNumber !== undefined && { copiesAvailable: copiesAvailableNumber }),
                ...(profileImage && { profileImage }),
            },
            { new: true }
        );

        if (!updatedBook) throw new ApiErrors(404, "Book not found");

        res.status(200).json({
            message: "Book updated successfully",
            book: updatedBook,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedBook = await BookModel.findByIdAndUpdate(
            req.params.id,
            { isDelete: true },
            { new: true }
        );
        if (!deletedBook) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json({ message: "Book soft-deleted successfully", book: deletedBook });
    } catch (error) {
        next(error);
    }
};

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


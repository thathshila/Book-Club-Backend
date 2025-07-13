import { Request, Response, NextFunction } from "express";
import { BookModel } from "../models/Book";

// View the catalog of books
export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const books = await BookModel.find();
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


// Edit book information
export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updatedBook = await BookModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(200).json(updatedBook);
    } catch (error) {
        next(error);
    }
};

// Delete a book from the collection
export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedBook = await BookModel.findByIdAndDelete(req.params.id);
        if (!deletedBook) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

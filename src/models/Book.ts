import mongoose from "mongoose";

export type Book = {
    title: string;
    author: string;
    isbn: string;
    publishedDate?: Date;
    genre?: string;
    description?: string;
    copiesAvailable: number;
    profileImage?: string;
};

const bookSchema = new mongoose.Schema<Book>({
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    publishedDate: Date,
    genre: String,
    description: String,
    copiesAvailable: { type: Number, default: 1 },
    profileImage: {
        type: String,
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/, "Must be a valid image URL"],
    },
}, { versionKey: false, timestamps: true });

export const BookModel = mongoose.model("Book", bookSchema);

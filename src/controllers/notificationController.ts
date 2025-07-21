import { Request, Response, NextFunction } from "express";
import { LendingModel } from "../models/Lending";
import { ReaderModel } from "../models/Reader";
import { BookModel } from "../models/Book";
import nodemailer from "nodemailer";
import { ApiErrors } from "../errors/ApiErrors";
import { updateOverdueStatuses } from "../utils/updateOverdueStatus";

// Send overdue notifications to readers
export const sendOverdueNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateOverdueStatuses(); // Ensure statuses are updated before sending

        // Fetch all overdue lendings with reader and book populated
        const overdueLendings = await LendingModel.find({ status: "overdue" })
            .populate("book", "title dueDate")
            .populate("reader", "email name");

        if (!overdueLendings.length) {
            return res.status(200).json({ message: "No overdue lendings found." });
        }

        // Group lendings by reader
        const readerMap: Record<string, { email: string; name: string; books: { title: string; dueDate: string }[] }> = {};

        overdueLendings.forEach((lending) => {
            const reader = lending.reader as any;
            if (!reader || !reader.email) return;

            if (!readerMap[reader._id]) {
                readerMap[reader._id] = {
                    email: reader.email,
                    name: reader.name,
                    books: [],
                };
            }

            const book = lending.book as any;
            readerMap[reader._id].books.push({
                title: book.title,
                dueDate: lending.dueDate.toDateString(),
            });
        });

        // Configure nodemailer transport (using Gmail example)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // your email
                pass: process.env.EMAIL_PASS, // your app password
            },
        });

        // Send emails
        const sendEmailPromises = Object.values(readerMap).map((reader) => {
            const bookList = reader.books
                .map((book) => `- ${book.title} (Due: ${book.dueDate})`)
                .join("\n");

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: reader.email,
                subject: "Overdue Book Notification - TURN THE PAGE Library",
                text: `Dear ${reader.name},\n\nThe following books you borrowed are overdue:\n\n${bookList}\n\nPlease return them as soon as possible to avoid further penalties.\n\nThank you,\nTURN THE PAGE Library`,
            };

            return transporter.sendMail(mailOptions);
        });

        await Promise.all(sendEmailPromises);

        res.status(200).json({
            message: `Notifications sent to ${sendEmailPromises.length} reader(s) with overdue books.`,
        });
    } catch (err) {
        next(err);
    }
};

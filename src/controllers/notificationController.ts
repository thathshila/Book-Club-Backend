import { Request, Response, NextFunction } from "express";
import { LendingModel } from "../models/Lending";
import nodemailer from "nodemailer";
import { updateOverdueStatuses } from "../utils/updateOverdueStatus";

export const sendOverdueNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateOverdueStatuses();

        const overdueLendings = await LendingModel.find({ status: "overdue" })
            .populate("book", "title dueDate")
            .populate("reader", "email name");

        if (!overdueLendings.length) {
            return res.status(200).json({ message: "No overdue lendings found." });
        }

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

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

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


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendWelcomeEmail = async (to: string, name: string) => {
    const mailOptions = {
        from: `"Book Club" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Welcome to the Book Club 📚",
        html: `<p>Dear ${name},</p>
               <p>Welcome to our Book Club! We're excited to have you as a member.</p>
               <p>Happy reading!<br/>– The Book Club Team</p>`,
    };

    await transporter.sendMail(mailOptions);
};

export const sendOtpEmail = async (to: string, otp: string) => {
    const mailOptions = {
        from: `"Book Club" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Reset Password - OTP Verification",
        html: `<p>Your OTP for resetting the password is:</p>
               <h2>${otp}</h2>
               <p>This OTP is valid for 10 minutes only.</p>`,
    };

    await transporter.sendMail(mailOptions);
};


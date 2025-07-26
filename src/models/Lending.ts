// import mongoose, { Schema, Document } from "mongoose";
//
// export interface Lending extends Document {
//     book: mongoose.Types.ObjectId;
//     reader: mongoose.Types.ObjectId;
//     borrowDate: Date;
//     dueDate: Date;
//     returnDate?: Date;
//     status: "borrowed" | "returned" ;
// }
//
// const lendingSchema = new Schema<Lending>(
//     {
//         book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
//         reader: { type: Schema.Types.ObjectId, ref: "User", required: true },
//         borrowDate: { type: Date, default: Date.now },
//         dueDate: { type: Date, required: true },
//         returnDate: { type: Date },
//         status: { type: String, enum: ["borrowed", "returned"], default: "borrowed" },
//     },
//     { timestamps: true, versionKey: false }
// );
//
// export const LendingModel = mongoose.model<Lending>("Lending", lendingSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface Lending extends Document {
    book: mongoose.Types.ObjectId;
    reader: mongoose.Types.ObjectId;
    borrowDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: "borrowed" | "returned" | "overdue";
    finePerDay: Number
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: Date;
    deletedBy?: string;
    deletedAt?: Date;

}

const lendingSchema = new Schema<Lending>(
    {
        book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
        reader: { type: Schema.Types.ObjectId, ref: "Reader", required: true },
        borrowDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true },
        returnDate: { type: Date },
        status: { type: String, enum: ["borrowed", "returned", "overdue"], default: "borrowed" },
        finePerDay: { type: Number, default: 10 },
        createdBy: {
            type: String,
            required: true,
        },
        updatedBy: {
            type: String,
        },
        updatedAt: {
            type: Date,
        },
        deletedBy: {
            type: String,
        },
        deletedAt: {
            type: Date,
        },
    },
    { timestamps: true, versionKey: false }
);

export const LendingModel = mongoose.model<Lending>("Lending", lendingSchema);

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
}

const lendingSchema = new Schema<Lending>(
    {
        book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
        reader: { type: Schema.Types.ObjectId, ref: "Reader", required: true },
        borrowDate: { type: Date, default: Date.now },
        dueDate: { type: Date, required: true },
        returnDate: { type: Date },
        status: { type: String, enum: ["borrowed", "returned", "overdue"], default: "borrowed" },
    },
    { timestamps: true, versionKey: false }
);

export const LendingModel = mongoose.model<Lending>("Lending", lendingSchema);

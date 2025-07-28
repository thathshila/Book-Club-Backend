import mongoose from "mongoose";

export type Reader = {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    isActive?: boolean;
    createdAt?: Date;
    memberId?: string | null;
    nic?: string;
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: Date;
    deletedBy?: string;
    deletedAt?: Date;
};

const generateMemberId = (prefix: string): string => {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit random
    return `${prefix}-${year}-${randomDigits}`;
};

const readerSchema = new mongoose.Schema<Reader>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            minlength: [3, "Name must be at least 3 characters"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, "Email must be valid"],
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        memberId: {
            type: String,
            unique: true,
            sparse: true,
            default: null,
        },
        nic: {
            type: String,
            trim: true,
            unique: true,
            match: [/^\d{9}[vVxX]$|^\d{12}$/, "NIC must be valid (e.g., 991234567V or 200012345678)"],
        },
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
    {
        versionKey: false,
    }
);


readerSchema.pre("save", async function (next) {
    if (!this.memberId) {
        const prefix = "Reader";
        let newMemberId = generateMemberId(prefix);

        while (await mongoose.models.Reader.findOne({ memberId: newMemberId })) {
            newMemberId = generateMemberId(prefix);
        }

        this.memberId = newMemberId;
    }
    next();
});

export const ReaderModel = mongoose.model("Reader", readerSchema);

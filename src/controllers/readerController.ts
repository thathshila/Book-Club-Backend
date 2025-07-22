import { Request, Response, NextFunction } from "express";
import { ReaderModel } from "../models/Reader";
import { ApiErrors } from "../errors/ApiErrors";

/**
 * 📌 Get all active readers
 * GET /api/readers
 */
export const getAllReaders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const readers = await ReaderModel.find({ isActive: true });
        res.status(200).json(readers);
    } catch (err) {
        next(err);
    }
};

/**
 * 📌 Add a new reader
 * POST /api/readers
 */
export const addReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, address, dateOfBirth, nic } = req.body;

        if (!name || !email || !nic) {
            throw new ApiErrors(400, "Name, email, and NIC are required");
        }

        const existingEmail = await ReaderModel.findOne({ email });
        if (existingEmail) throw new ApiErrors(400, "Email already registered");

        const existingNic = await ReaderModel.findOne({ nic });
        if (existingNic) throw new ApiErrors(400, "NIC already registered");

        const reader = new ReaderModel({
            name,
            email,
            phone,
            address,
            dateOfBirth,
            nic,
        });

        await reader.save();

        res.status(201).json({
            message: "Reader added successfully",
            reader,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 📌 Update reader details
 * PUT /api/readers/:id
 */
export const updateReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const readerId = req.params.id;
        const { name, phone, address, dateOfBirth } = req.body;

        const updateData: any = {
            ...(name && { name }),
            ...(phone && { phone }),
            ...(address && { address }),
            ...(dateOfBirth && { dateOfBirth }),
        };

        const updatedReader = await ReaderModel.findByIdAndUpdate(readerId, updateData, { new: true });

        if (!updatedReader) throw new ApiErrors(404, "Reader not found");

        res.status(200).json({
            message: "Reader updated successfully",
            reader: updatedReader,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * 📌 Delete (deactivate) a reader
 * DELETE /api/readers/:id
 */
export const deleteReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const readerId = req.params.id;

        const reader = await ReaderModel.findById(readerId);
        if (!reader) throw new ApiErrors(404, "Reader not found");

        reader.isActive = false;
        await reader.save();

        res.status(200).json({ message: "Reader deleted successfully" });
    } catch (err) {
        next(err);
    }
};

export const getAllReadersFilter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, nic, phone } = req.query;

        const filter: any = { isActive: true };

        if (name) filter.name = { $regex: name, $options: "i" };
        if (email) filter.email = { $regex: email, $options: "i" };
        if (nic) filter.nic = { $regex: nic, $options: "i" };
        if (phone) filter.phone = { $regex: phone, $options: "i" };

        const readers = await ReaderModel.find(filter);
        res.status(200).json(readers);
    } catch (err) {
        next(err);
    }
};

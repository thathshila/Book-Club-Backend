
import { Request, Response, NextFunction } from "express";
import { ReaderModel } from "../models/Reader";
import { ApiErrors } from "../errors/ApiErrors";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "./notificationController";
import { AuditLogModel } from "../models/AuditLog";

const getUserFromToken = (req: Request) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw new ApiErrors(401, "Unauthorized: No token");
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
    return { userId: decoded.userId, role: decoded.role, name: decoded.name };
};

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

export const getAllReaders = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const readers = await ReaderModel.find({ isActive: true });
        res.status(200).json(readers);
    } catch (err) {
        next(err);
    }
};

export const addReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const profileImage = req.file?.path;

        const reader = new ReaderModel({
            ...req.body,
            profileImage,
            createdBy: name,
            createdAt: new Date(),
        });

        await reader.save();

        await logAudit("CREATE", name, "Reader", reader._id.toString(), `Reader '${reader.name}' created`);

        if (reader.isActive && reader.email) {
            await sendWelcomeEmail(reader.email, reader.name);
        }

        res.status(201).json({ message: "Reader added", reader });
    } catch (err: any) {
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map((val: any) => val.message);
            return next(new ApiErrors(400, messages.join(", ")));
        }
        next(err);
    }
};

export const updateReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const { id } = req.params;
        const profileImage = req.file?.path;

        const update = {
            ...req.body,
            ...(profileImage && { profileImage }),
            updatedBy: name,
            updatedAt: new Date(),
        };

        const updated = await ReaderModel.findByIdAndUpdate(id, update, { new: true });
        if (!updated) throw new ApiErrors(404, "Reader not found");

        await logAudit("UPDATE", name, "Reader", updated._id.toString(), `Reader '${updated.name}' updated`);

        res.status(200).json({ message: "Reader updated", updated });
    } catch (err) {
        next(err);
    }
};

export const deleteReader = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = getUserFromToken(req);
        const { id } = req.params;

        const deleted = await ReaderModel.findByIdAndUpdate(
            id,
            { isActive: false, deletedBy: name, deletedAt: new Date() },
            { new: true }
        );

        if (!deleted) throw new ApiErrors(404, "Reader not found");

        await logAudit("DELETE", name, "Reader", deleted._id.toString(), `Reader '${deleted.name}' soft deleted`);

        res.status(200).json({ message: "Reader soft deleted", deleted });
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

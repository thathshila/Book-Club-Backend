import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ["CREATE", "UPDATE", "DELETE", "LEND", "RETURN", "LOGIN", "OTHER"],
        required: true,
    },
    performedBy: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
});

export const AuditLogModel = mongoose.model("AuditLog", auditLogSchema);
import { AuditLogModel } from "../models/AuditLog";

// export const logAudit = async ({
//                                    userId,
//                                    action,
//                                    resourceType,
//                                    resourceId,
//                                    details
//                                }: {
//     userId: string;
//     action: string;
//     resourceType: string;
//     resourceId: string;
//     details?: string;
// }) => {
//     try {
//         await AuditLogModel.create({
//             userId,
//             action,
//             resourceType,
//             resourceId,
//             details,
//         });
//     } catch (err) {
//         console.error("Failed to log audit:", err);
//     }
// };


export const logAudit = async ({
                                   userId,
                                   userName,
                                   userRole,
                                   action,
                                   resourceType,
                                   resourceId,
                                   details
                               }: {
    userId: string;
    userName: string;   // ✅ NEW
    userRole: string;   // ✅ NEW
    action: string;
    resourceType: string;
    resourceId: string;
    details?: any;      // allow object or string
}) => {
    try {
        await AuditLogModel.create({
            userId,
            userName,
            userRole,
            action,
            resourceType,
            resourceId,
            details: typeof details === "string" ? details : JSON.stringify(details),
        });
    } catch (err) {
        console.error("Failed to log audit:", err);
    }
};

import { LendingModel } from "../models/Lending";

export const updateOverdueStatuses = async () => {
    const now = new Date();
    await LendingModel.updateMany(
        { dueDate: { $lt: now }, status: "borrowed" },
        { $set: { status: "overdue" } }
    );
};

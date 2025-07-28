import { BookModel } from "../models/Book";
import { ReaderModel } from "../models/Reader";
import { LendingModel } from "../models/Lending";


export const getDashboardCounts = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
        totalBooks,
        totalReaders,
        booksLentOut,
        overdueBooks,
        pendingReturnsToday
    ] = await Promise.all([

        BookModel.countDocuments({ isDelete: false }),

        ReaderModel.countDocuments({ isActive: true }),

        LendingModel.countDocuments({
            status: 'borrowed',
            returnDate: { $exists: false }
        }),

        LendingModel.countDocuments({
            status: 'overdue',
            dueDate: { $lt: new Date() },
            returnDate: { $exists: false }
        }),

        LendingModel.countDocuments({
            dueDate: {
                $gte: todayStart,
                $lte: todayEnd
            },
            returnDate: { $exists: false }
        })
    ]);

    return {
        totalBooks,
        totalReaders,
        booksLentOut,
        overdueBooks,
        pendingReturnsToday
    };
};
// import { Router } from "express";
// import { lendBook, getLendingHistory, returnBook } from "../controllers/lendingController";
// import { verifyToken, authorizeRoles } from "../middlewares/verifyAccessToken";
//
// const lendingRouter = Router();
//
// // Lend a book (admin/librarian)
// lendingRouter.post("/", verifyToken, authorizeRoles("admin", "librarian"), lendBook);
//
// // View lending history (admin/librarian)
// lendingRouter.get("/", verifyToken, authorizeRoles("admin", "librarian"), getLendingHistory);
//
// // Return a book (admin/librarian)
// lendingRouter.put("/:id/return", verifyToken, authorizeRoles("admin", "librarian"), returnBook);
//
// export default lendingRouter;
import { Router } from "express";
import {
    lendBook,
    getLendingHistory,
    returnBook,
    getOverdueLendings,
    calculateOverduePayments
} from "../controllers/lendingController";
import { verifyToken, authorizeRoles } from "../middlewares/verifyAccessToken";

const lendingRouter = Router();

lendingRouter.post("/", verifyToken, authorizeRoles("staff", "librarian"), lendBook);
lendingRouter.get("/", verifyToken, authorizeRoles("staff", "librarian"), getLendingHistory);
lendingRouter.put("/:id/return", verifyToken, authorizeRoles("staff", "librarian"), returnBook);

// Overdue management endpoint
lendingRouter.get("/overdue", verifyToken, authorizeRoles("staff", "librarian"), getOverdueLendings);
lendingRouter.get("/overdue-payments", calculateOverduePayments);
export default lendingRouter;

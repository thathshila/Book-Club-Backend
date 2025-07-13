import { Router } from "express";
import { addBook, deleteBook, getAllBooks, updateBook } from "../controllers/bookController";
import { verifyToken, authorizeRoles } from "../middlewares/verifyAccessToken";
import {upload} from "../middlewares/upload";

const bookRouter = Router();

// View the catalog of books (public or protected based on your system)
bookRouter.get("/", getAllBooks);

// Add a new book (protected, only librarian/admin)
bookRouter.post("/", verifyToken, authorizeRoles("admin", "librarian"), upload.single("profileImage"), addBook);

// Edit book information (protected, only librarian/admin)
bookRouter.put("/:id", verifyToken, authorizeRoles("admin", "librarian"), updateBook);

// Delete a book (protected, only librarian/admin)
bookRouter.delete("/:id", verifyToken, authorizeRoles("admin", "librarian"), deleteBook);

export default bookRouter;

import { Router } from "express";
import {addBook, deleteBook, getAllBooks, getAllBooksFilter, updateBook} from "../controllers/bookController";
import { verifyToken, authorizeRoles } from "../middlewares/verifyAccessToken";
import {upload} from "../middlewares/upload";

const bookRouter = Router();

// View the catalog of books (public or protected based on your system)
bookRouter.get("/", getAllBooks);

// Add a new book (protected, only librarian/admin)
bookRouter.post("/", verifyToken, authorizeRoles("staff", "librarian"), upload.single("profileImage"), addBook);

// Edit book information (protected, only librarian/admin)
bookRouter.put("/:id", verifyToken, authorizeRoles("staff", "librarian"),upload.single("profileImage"), updateBook);

// Delete a book (protected, only librarian/admin)
bookRouter.delete("/:id", verifyToken, authorizeRoles("staff", "librarian"), deleteBook);

bookRouter.get("/filter",verifyToken,authorizeRoles("staff", "librarian"),getAllBooksFilter)
export default bookRouter;

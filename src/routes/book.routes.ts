import { Router } from "express";
import {addBook, deleteBook, getAllBooks, getAllBooksFilter, updateBook} from "../controllers/bookController";
import { verifyToken, authorizeRoles } from "../middlewares/verifyAccessToken";
import {upload} from "../middlewares/upload";

const bookRouter = Router();

bookRouter.get("/", getAllBooks);

bookRouter.post("/", verifyToken, authorizeRoles("staff", "librarian"), upload.single("profileImage"), addBook);

bookRouter.put("/:id", verifyToken, authorizeRoles("staff", "librarian"),upload.single("profileImage"), updateBook);

bookRouter.delete("/:id", verifyToken, authorizeRoles("staff", "librarian"), deleteBook);

bookRouter.get("/filter",verifyToken,authorizeRoles("staff", "librarian"),getAllBooksFilter)
export default bookRouter;


import express, { Request, Response } from "express"
import dotenv from "dotenv"
import { connectDB } from "./db/mongo"
import rootRouter from "./routes"
import { errorHandler } from "./middlewares/errorHandler"
import cors from "cors"
import cookieParser from "cookie-parser";

dotenv.config()
const app = express()

// handle cors
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeader: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))
app.use(cookieParser());
app.use(express.json())
// to give express the ability to handle jsons

const PORT = process.env.PORT

app.use("/api", rootRouter)
app.use(errorHandler)

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    })
})
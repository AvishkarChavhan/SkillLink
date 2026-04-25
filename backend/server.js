import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import postsRoutes from "./routes/posts.routes.js";
import UserRoutes from "./routes/user.routes.js";
import fs from "fs";

dotenv.config();

const app = express();

// ✅ Create uploads folder if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use(cors({
    origin: ["https://skill-link-psi-gules.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"], // ✅ added "token" header
    credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("uploads"));

app.use(postsRoutes);
app.use(UserRoutes);

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        app.listen(5000, () => {
            console.log("server is running on port 5000....");
        })
    } catch (e) {
        console.log(e.message);
    }
}
start();
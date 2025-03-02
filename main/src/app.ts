import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/contestants.routes";
import problemsRoutes from "./routes/problems.routes";
import submissionRoutes from "./routes/submissions.routes";
import customtestRoutes from "./routes/customtest.routes";
import userRoutes from "./routes/user.routes";
import friend from "./routes/friend.routes"


const app = express();

dotenv.config();

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL, 
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(authRoutes);
app.use(usersRoutes);
app.use(problemsRoutes);
app.use(userRoutes);
app.use(submissionRoutes);
app.use(customtestRoutes)
app.use(friend);

export default app;

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import problemsRoutes from "./routes/problems.routes";
import usersRoutes from "./routes/contestants.routes";
import userRoutes from "./routes/user.routes"

import dotenv from "dotenv";


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
app.use(testRoutes);
app.use(usersRoutes);
app.use(problemsRoutes);
app.use(userRoutes);





export default app;

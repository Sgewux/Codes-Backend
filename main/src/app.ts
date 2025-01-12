import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import problemsRoutes from "./routes/problems.routes";
import usersRoutes from "./routes/contestants.routes";

const app = express();

app.use(
  cors({
    credentials: false,
    origin: "*", // This is not good and we have to make it work with an specific origin (idk why it does not)
  })
);

app.use(express.json());
app.use(cookieParser());

app.use(authRoutes);
app.use(testRoutes);
app.use(usersRoutes);
app.use(problemsRoutes);


export default app;

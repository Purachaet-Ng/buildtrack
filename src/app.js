import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoute from "./routes/auth.route.js";
import projectRoute from "./routes/projects.route.js";

const app = express();
app.use(express.json());

app.get("/check", (req, res) => {
  res.send("hello");
});

app.use("/auth", authRoute);
app.use("/projects", projectRoute);

app.use(errorHandler);

export default app;

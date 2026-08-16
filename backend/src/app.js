import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import { pathNotFound } from "./middlewares/pathNotFound.js";
import authRoute from "./routes/auth.route.js";
import projectRoute from "./routes/projects.route.js";
import companyRoute from "./routes/companies.route.js";
import userRoute from "./routes/users.route.js";

const app = express();

// The Vite dev server runs on a different origin, so the browser needs this
// before it will let the SPA call the API at all.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// Everything lives under /api/v1 — see APIs.md
const API = "/api/v1";

app.get(`${API}/health`, (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(`${API}/auth`, authRoute);
app.use(`${API}/projects`, projectRoute);
app.use(`${API}/companies`, companyRoute);
app.use(`${API}/users`, userRoute);

app.use(pathNotFound);
app.use(errorHandler);

export default app;

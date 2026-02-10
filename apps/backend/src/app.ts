import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOrigins = process.env.CORS_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: corsOrigins && corsOrigins.length > 0
        ? corsOrigins
        : (process.env.NODE_ENV === "production" ? false : "*"),
    credentials: true,
}));

export default app;

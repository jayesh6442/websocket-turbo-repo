import app from "./app.js";
import roomRouter from "./routes/room.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";

app.use("/api/users", userRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/messages", messageRouter);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

import app from "./app.js";
import roomRouter from "./routes/room.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";

app.use("/api/users", userRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/messages", messageRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

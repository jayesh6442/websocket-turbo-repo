import app from "./app.js";
import roomRouter from "./routes/room.routes.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/users", userRouter);
app.use("/api/rooms", roomRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

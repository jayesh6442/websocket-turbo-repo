import app from "./app.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/users", userRouter);


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

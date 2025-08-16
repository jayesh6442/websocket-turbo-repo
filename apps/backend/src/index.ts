import app from "./app.js";
import prisma from "@repo/db";


const user = await prisma.user.findUnique({
    where: {
        id: 1
    }
});

console.log(user);

app.get("/", (req, res) => {
    res.send("Hello World!");
})



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

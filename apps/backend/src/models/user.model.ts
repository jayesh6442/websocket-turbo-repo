import { z } from "zod";



const UserSchema = z.object({
    password: z.string().min(6).max(100),
    email: z.string().email(),
    name: z.string().min(2).max(100),
});


export default UserSchema;
import { z } from "zod";



const roomSchema = z.object({
    name: z.string().min(2).max(100),
});

export default roomSchema;
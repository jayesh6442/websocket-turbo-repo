import prisma from "@repo/db";
import bcrypt from "bcrypt";

export async function createUser(email: string, password: string, name: string) {
    console.log("Creating user:", { email, name });
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: { email, password: hashedPassword, name },
    });
}

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
}


export async function findUserById(id: number) {
    // @ts-ignore
    return prisma.user.findUnique({ where: { id } });
}
export async function validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}


import prisma from "@repo/db";

export async function findRooms() {
    return prisma.room.findMany();
}

export async function findRoomById(id: string) {
    return prisma.room.findUnique({ where: { id } });
}

export async function createRoom(name: string, ownerId: string) {
    return prisma.room.create({
        data: { name, ownerId },
    });
}

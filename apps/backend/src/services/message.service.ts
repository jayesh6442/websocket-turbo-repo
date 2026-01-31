import prisma from "@repo/db";

export async function findMessagesByRoomId(roomId: string, limit: number = 50, offset: number = 0) {
    return prisma.message.findMany({
        where: { roomId },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc', // Oldest first
        },
        take: limit,
        skip: offset,
    });
}

export async function getMessageCount(roomId: string) {
    return prisma.message.count({
        where: { roomId },
    });
}

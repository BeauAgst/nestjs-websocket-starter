import { CreateRoomInput } from "../dto/create-room.input";
import { Room } from "../schema/room.schema";

export const mapCreateRoomInputToStoreModel = (
    input: CreateRoomInput,
    passphrase: string,
): Room => {
    const createdAt = new Date();

    return {
        createdAt,
        maxUsers: input.maxUsers ?? null,
        passphrase,
        roomOwnerId: input.userId,
        users: [input.userId],
        updatedAt: createdAt,
    };
};

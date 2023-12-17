import { CreateRoomInput } from "../dto/create-room.input";
import { Room } from "../../model/room.model";

export const mapCreateRoomInputToStoreModel = (
    input: CreateRoomInput,
    passphrase: string,
): Room => {
    const createdAt = new Date();

    return {
        createdAt,
        host: input.user,
        id: passphrase,
        maxUsers: input.maxUsers ?? null,
        updatedAt: createdAt,
        users: [],
    };
};

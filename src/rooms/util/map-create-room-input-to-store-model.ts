import { CreateRoomInput } from "../dto/create-room.input";
import { v4 as uuid } from "uuid";
import { Room } from "../../model/room.model";

export const mapCreateRoomInputToStoreModel = (
    input: CreateRoomInput,
    passphrase: string,
): Room => {
    const createdAt = new Date();

    return {
        createdAt,
        host: input.user,
        id: uuid(),
        maxUsers: input.maxUsers ?? null,
        passphrase,
        updatedAt: createdAt,
        users: [],
    };
};

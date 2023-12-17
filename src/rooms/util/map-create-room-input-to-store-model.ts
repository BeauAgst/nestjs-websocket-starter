import { CreateRoomInput } from "../dto/create-room.input";
import { Room } from "../../model/room.model";
import { mapUserToStoreModel } from "./map-user-to-store-model";

export const mapCreateRoomInputToStoreModel = (
    input: CreateRoomInput,
    passphrase: string,
): Room => {
    const createdAt = new Date();

    return {
        createdAt,
        host: mapUserToStoreModel(input.user),
        id: passphrase,
        isLocked: input.isLocked ?? false,
        maxUsers: input.maxUsers ?? null,
        updatedAt: createdAt,
        users: [],
    };
};

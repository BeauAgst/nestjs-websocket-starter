import { CreateRoomInput } from "../dto/create-room.input";
import { Room } from "../../model/room.model";
import { mapUserInputToStoreModel } from "./map-user-input-to-store-model";

export const mapCreateRoomInputToStoreModel = (
    input: CreateRoomInput,
    passphrase: string,
): Room => {
    const createdAt = new Date();

    return {
        createdAt,
        id: passphrase,
        isLocked: input.isLocked ?? false,
        maxUsers: input.maxUsers ?? null,
        updatedAt: createdAt,
        users: [mapUserInputToStoreModel(input.user, true)],
    };
};

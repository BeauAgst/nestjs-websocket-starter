import { plainToInstance } from "class-transformer";
import { Room as RoomDtoModel } from "../models/room.model";
import { RoomDocument } from "../schema/room.schema";

export const mapRoomStoreModelToDto = (storeModel: RoomDocument, userId: string): RoomDtoModel => {
    if (!storeModel) return null;

    const model: RoomDtoModel = {
        createdAt: storeModel.createdAt,
        id: storeModel._id.toHexString(),
        isRoomOwner: storeModel.roomOwnerId === userId,
        maxUsers: storeModel.maxUsers,
        passphrase: storeModel.passphrase,
        updatedAt: storeModel.updatedAt,
    };

    return plainToInstance(RoomDtoModel, model);
};

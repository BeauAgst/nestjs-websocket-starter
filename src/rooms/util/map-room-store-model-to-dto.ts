import { plainToInstance } from "class-transformer";
import type { RoomStoreModel } from "src/model/room-store.model";

import { RoomDtoModel } from "../dto/room-dto.model";

export const mapRoomStoreModelToDto = (room: RoomStoreModel): RoomDtoModel => {
    if (!room) return null;

    const mapped: RoomDtoModel = {
        createdAt: room.createdAt,
        hostId: room.hostId,
        id: room.id,
        isLocked: room.isLocked,
        maxUsers: room.maxUsers,
        updatedAt: room.updatedAt,
    };

    return plainToInstance(RoomDtoModel, mapped);
};

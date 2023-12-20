import { plainToInstance } from "class-transformer";
import type { UserStoreModel } from "src/model/user-store.model";

import { UserDtoModel } from "../dto/user-dto.model";

export const mapUserStoreModelToDto = (room: UserStoreModel): UserDtoModel => {
    if (!room) return null;

    const mapped: UserDtoModel = {
        id: room.id,
        name: room.name,
        status: room.status,
    };

    return plainToInstance(UserDtoModel, mapped);
};

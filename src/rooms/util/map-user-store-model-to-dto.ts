import { plainToInstance } from "class-transformer";
import type { UserStoreModel } from "src/model/user-store.model";

import { UserDtoModel } from "../dto/user-dto.model";

export const mapUserStoreModelToDto = (user: UserStoreModel): UserDtoModel => {
    if (!user) return null;

    const mapped: UserDtoModel = {
        id: user.id,
        name: user.name,
        socketId: user.socketId,
        status: user.status,
    };

    return plainToInstance(UserDtoModel, mapped);
};

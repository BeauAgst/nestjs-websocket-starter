import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import { type LikeUserStatus, UserStatus } from "src/model/enum/user-status.enum";
import type { UserInput } from "src/rooms/dto/user.input";
import { mapUserStoreModelToDto } from "src/rooms/util/map-user-store-model-to-dto";

import { UsersStore } from "./users.store";

@Injectable()
export class UsersService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly usersStore: UsersStore,
    ) {
        this.logger.setContext(this.constructor.name);
    }

    createUser({ name, socketId }: { name: string; socketId: string }) {
        const user = this.usersStore.createUser({ name, socketId });

        return mapUserStoreModelToDto(user);
    }

    getUserById(userId: string) {
        const user = this.usersStore.getUserById(userId);
        return mapUserStoreModelToDto(user);
    }

    getUsersById(userIds: string[]) {
        return userIds.map((userId) => this.getUserById(userId));
    }

    getOrCreateUser(user: UserInput, socketId: string) {
        const existingUser = this.getUserById(user?.id);

        if (!existingUser) {
            return this.createUser({ name: user.name, socketId });
        }

        this.usersStore.updateSocket(socketId, user.id);

        const updatedUser = this.usersStore.updateUser(user.id, {
            name: user.name,
            status: UserStatus.Active,
        });

        return mapUserStoreModelToDto(updatedUser);
    }

    updateUserStatusForSocketId(socketId: string, status: LikeUserStatus) {
        const user = this.usersStore.getUserBySocketId(socketId);

        if (!user) {
            const message = "User does not exist with socket ID";
            this.logger.info({ socketId }, message);
            return null;
        }

        const updatedUser = this.usersStore.updateUser(user.id, { status });

        return mapUserStoreModelToDto(updatedUser);
    }

    updateUserStatusForUserId(userId: string, status: LikeUserStatus) {
        const user = this.usersStore.getUserById(userId);

        if (!user) {
            const message = "User does not exist with socket ID";
            this.logger.info({ userId }, message);
            return null;
        }

        const updatedUser = this.usersStore.updateUser(user.id, { status });

        return mapUserStoreModelToDto(updatedUser);
    }
}

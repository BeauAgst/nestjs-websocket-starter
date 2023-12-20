import { Injectable } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import type { LikeUserStatus } from "src/model/enum/user-status.enum";
import { UserStatus } from "src/model/enum/user-status.enum";
import type { UserStoreModel } from "src/model/user-store.model";
import { v4 as uuid } from "uuid";

type CreateUserInput = {
    name: string;
    socketId: string;
};

type UpdateUserInput = {
    name?: string;
    socketId?: string;
    status?: LikeUserStatus;
};

@Injectable()
export class UsersStore {
    private sockets: Map<string, string> = new Map();
    private users: Map<string, UserStoreModel> = new Map();

    constructor(private readonly logger: PinoLogger) {
        this.logger.setContext(this.constructor.name);
    }

    createUser(input: CreateUserInput) {
        const createdAt = new Date();

        const id = uuid();

        const user: UserStoreModel = {
            createdAt,
            id,
            name: input.name,
            status: UserStatus.Active,
            updatedAt: createdAt,
        };

        this.sockets.set(input.socketId, id);
        this.users.set(id, user);

        return user;
    }

    getUserById(userId: string) {
        if (!userId) return;
        return this.users.get(userId);
    }

    getUserBySocketId(socketId: string) {
        const userId = this.sockets.get(socketId);

        if (!userId) return;

        return this.getUserById(userId);
    }

    updateUser(userId: string, input: UpdateUserInput) {
        const user = this.getUserById(userId);

        if (!user) {
            return null;
        }
        const updatedUser: UserStoreModel = {
            ...user,
            name: input.name ?? user.name,
            status: input.status ?? user.status,
            updatedAt: new Date(),
        };

        this.sockets.set(input.socketId, userId);
        this.users.set(userId, updatedUser);

        return updatedUser;
    }

    updateSocket(socketId: string, userId: string) {
        return this.sockets.set(socketId, userId);
    }

    deleteSocket(socketId: string) {
        this.sockets.delete(socketId);
    }
}

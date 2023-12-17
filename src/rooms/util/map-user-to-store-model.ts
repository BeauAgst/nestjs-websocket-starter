import { User } from "src/model/user.model";

export const mapUserToStoreModel = (user: User, isHost: boolean): User => {
    return {
        id: user.id,
        isHost,
        name: user.name,
        socketId: user.socketId,
    };
};

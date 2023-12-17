import { User } from "src/model/user.model";

export const mapUserToStoreModel = (user: User): User => {
    return {
        id: user.id,
        name: user.name,
        socketId: user.socketId,
    };
};

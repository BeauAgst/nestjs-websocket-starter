import { User } from "src/model/user.model";
import { UserInput } from "../dto/user.input";

export const mapUserToStoreModel = (user: UserInput, isHost: boolean): User => {
    return {
        id: user.id,
        isHost,
        name: user.name,
        socketId: user.socketId,
    };
};

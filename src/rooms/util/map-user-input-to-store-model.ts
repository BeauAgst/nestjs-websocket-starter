import type { User } from "../../model/user.model";
import type { UserInput } from "../dto/user.input";

export const mapUserInputToStoreModel = (user: UserInput, isHost: boolean): User => {
    return {
        id: user.id,
        isHost,
        name: user.name,
        socketId: user.socketId,
    };
};

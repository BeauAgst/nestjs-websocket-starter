import { UserInput } from "../dto/user.input";
import { mapUserInputToStoreModel } from "./map-user-input-to-store-model";

const TEST_USER_INPUT: UserInput = {
    id: "id",
    name: "name",
    socketId: "socketId",
};

describe("mapUserInputToStoreModel", () => {
    test("should map the input correctly", () => {
        const result = mapUserInputToStoreModel(TEST_USER_INPUT, true);
        expect(result).toEqual({
            id: TEST_USER_INPUT.id,
            isHost: true,
            name: TEST_USER_INPUT.name,
            socketId: TEST_USER_INPUT.socketId,
        });
    });

    test("should set isHost to false if value is set", () => {
        const result = mapUserInputToStoreModel(TEST_USER_INPUT, false);
        expect(result.isHost).toEqual(false);
    });
});

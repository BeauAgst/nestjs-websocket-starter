import type { User } from "../../model/user.model";
import type { CreateRoomInput } from "../dto/create-room.input";
import { mapCreateRoomInputToStoreModel } from "./map-create-room-input-to-store-model";
import { mapUserInputToStoreModel } from "./map-user-input-to-store-model";

jest.mock("./map-user-input-to-store-model");

const TEST_INPUT: CreateRoomInput = {
    isLocked: true,
    maxUsers: 5,
    user: {
        id: "id",
        name: "name",
        socketId: "socketId",
    },
};

const TEST_PASSPHRASE = "TEST_PASSPHRASE";

const MOCK_USER: User = {
    id: "id",
    isHost: true,
    name: "name",
    socketId: "socketId",
};

describe("mapCreateRoomInputToStoreModel", () => {
    const mockMapUserInputToStoreModel = mapUserInputToStoreModel as jest.Mock;

    beforeEach(() => {
        mockMapUserInputToStoreModel.mockReturnValue(MOCK_USER);
    });

    test("should map the room as expected", () => {
        const result = mapCreateRoomInputToStoreModel(TEST_INPUT, TEST_PASSPHRASE);

        expect(mockMapUserInputToStoreModel).toHaveBeenCalledWith(TEST_INPUT.user, true);

        expect(result).toEqual({
            createdAt: expect.any(Date),
            id: TEST_PASSPHRASE,
            isLocked: TEST_INPUT.isLocked,
            maxUsers: TEST_INPUT.maxUsers,
            updatedAt: expect.any(Date),
            users: [MOCK_USER],
        });
    });

    test("should default the room to unlocked if no configuration is passed", () => {
        const TEST_INPUT_NO_LOCKED_CONFIG: CreateRoomInput = {
            ...TEST_INPUT,
            isLocked: undefined,
        };

        const result = mapCreateRoomInputToStoreModel(TEST_INPUT_NO_LOCKED_CONFIG, TEST_PASSPHRASE);

        expect(result.isLocked).toBe(false);
    });

    test("should default maxUsers to null if no configuration is passed", () => {
        const TEST_INPUT_NO_LOCKED_CONFIG: CreateRoomInput = {
            ...TEST_INPUT,
            maxUsers: undefined,
        };

        const result = mapCreateRoomInputToStoreModel(TEST_INPUT_NO_LOCKED_CONFIG, TEST_PASSPHRASE);

        expect(result.maxUsers).toBeNull();
    });
});

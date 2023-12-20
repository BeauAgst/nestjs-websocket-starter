import { customAlphabet } from "nanoid";

import { ROOM_ID_ALPHABET, ROOM_ID_LENGTH } from "./constants";
import { generateRoomId } from "./generate-room-id";

jest.mock("nanoid", () => ({
    customAlphabet: jest.fn(),
}));

describe("generateRoomId", () => {
    const mockGenerator = jest.fn();
    const mockCustomAlphabet = customAlphabet as jest.Mock;

    beforeEach(() => {
        jest.resetAllMocks();
        mockCustomAlphabet.mockReturnValue(mockGenerator);
    });

    test("should create an ID generator using the correct alphabet and ID length", () => {
        mockGenerator.mockReturnValue("foo");

        const result = generateRoomId();

        expect(customAlphabet).toHaveBeenCalledWith(ROOM_ID_ALPHABET, ROOM_ID_LENGTH);
        expect(result).toBe("foo");
    });

    test("should keep generating IDs if profane words are returned", () => {
        mockGenerator
            .mockReturnValueOnce("SHIT")
            .mockReturnValueOnce("SH1T")
            .mockReturnValueOnce("foo");

        const result = generateRoomId();

        expect(customAlphabet).toHaveBeenCalledWith(ROOM_ID_ALPHABET, ROOM_ID_LENGTH);
        expect(mockGenerator).toHaveBeenCalledTimes(3);
        expect(result).toBe("foo");
    });
});

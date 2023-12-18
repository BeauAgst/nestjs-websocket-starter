import { customAlphabet } from "nanoid";
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

    test("should create an ID generator using the alphabet and size args", () => {
        const alphabet = "aaaaa";
        const size = 10;

        mockGenerator.mockReturnValue("foo");

        const result = generateRoomId(alphabet, size);

        expect(customAlphabet).toHaveBeenCalledWith(alphabet, size);
        expect(result).toEqual("foo");
    });

    test("should keep generating IDs if profane words are returned", () => {
        const alphabet = "aaaaa";
        const size = 10;

        mockGenerator
            .mockReturnValueOnce("SHIT")
            .mockReturnValueOnce("SH1T")
            .mockReturnValueOnce("foo");

        const result = generateRoomId(alphabet, size);

        expect(customAlphabet).toHaveBeenCalledWith(alphabet, size);
        expect(mockGenerator).toHaveBeenCalledTimes(3);
        expect(result).toEqual("foo");
    });
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Filter = require("bad-words");
import { customAlphabet } from "nanoid";

const filter = new Filter();

const generateCleanRoomId = (generator) => {
    const roomId = generator();
    if (filter.isProfane(roomId)) return generateCleanRoomId(generator);
    return roomId;
};

export const generateRoomId = (alphabet, size) => {
    const generator = customAlphabet(alphabet, size);
    return generateCleanRoomId(generator);
};

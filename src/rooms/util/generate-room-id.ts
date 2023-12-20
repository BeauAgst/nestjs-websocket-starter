// eslint-disable-next-line @typescript-eslint/no-var-requires
const Filter = require("bad-words");
import { customAlphabet } from "nanoid";

import { ROOM_ID_ALPHABET, ROOM_ID_LENGTH } from "./constants";

const filter = new Filter();

export const generateRoomId = () => {
    const generator = customAlphabet(ROOM_ID_ALPHABET, ROOM_ID_LENGTH);
    const roomId = generator();
    if (filter.isProfane(roomId)) return generateRoomId();
    return roomId;
};

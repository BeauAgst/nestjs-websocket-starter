// eslint-disable-next-line @typescript-eslint/no-var-requires
const Filter = require("bad-words");
import { customAlphabet } from "nanoid";

const filter = new Filter();

export const generateRoomPassphrase = (alphabet, size) => {
    const generatePassphrase = customAlphabet(alphabet, size);

    const generateCleanPassphrase = () => {
        const passphrase = generatePassphrase();
        if (filter.isProfane(passphrase)) return generateCleanPassphrase();
        return passphrase;
    };

    return generateCleanPassphrase();
};

import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService {
    constructor(private config: NestConfigService) {}

    get roomPassphraseAlphabet() {
        return this.config.get<string>("ROOM_PASSPHRASE_ALPHABET");
    }

    get roomPassphraseLength() {
        return this.config.get<number>("ROOM_PASSPHRASE_LENGTH");
    }
}

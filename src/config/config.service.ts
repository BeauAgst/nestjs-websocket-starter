import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

@Injectable()
export class ConfigService {
    constructor(private config: NestConfigService) {}

    get roomIdAlphabet() {
        return this.config.get<string>("ROOM_ID_ALPHABET");
    }

    get roomIdLength() {
        return this.config.get<number>("ROOM_ID_LENGTH");
    }
}

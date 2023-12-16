import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import * as joi from "joi";

import { ConfigService } from "./config.service";

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: false,
            validationSchema: joi.object({
                ROOM_PASSPHRASE_ALPHABET: joi.string().required(),
                ROOM_PASSPHRASE_LENGTH: joi.string().required(),
            }),
        }),
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}

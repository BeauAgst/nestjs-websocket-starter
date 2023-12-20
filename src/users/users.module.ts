import { Module } from "@nestjs/common";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UsersStore } from "./users.store";

@Module({
    controllers: [UsersController],
    exports: [UsersService],
    providers: [UsersService, UsersStore],
})
export class UsersModule {}

import { Controller, Get, NotFoundException, Param } from "@nestjs/common";

import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get(":id")
    getRoom(@Param("id") id: string) {
        const user = this.usersService.getUserById(id);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }
}

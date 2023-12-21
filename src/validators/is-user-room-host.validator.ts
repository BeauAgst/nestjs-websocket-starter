import { Injectable } from "@nestjs/common";
import type { ValidationArguments, ValidatorConstraintInterface } from "class-validator";
import { ValidatorConstraint } from "class-validator";
import { RoomsService } from "src/rooms/rooms.service";

@ValidatorConstraint({ name: "IsUserRoomHost" })
@Injectable()
export class IsUserRoomHost implements ValidatorConstraintInterface {
    constructor(private readonly roomsService: RoomsService) {}

    validate(userId: string, args?: ValidationArguments): boolean {
        const roomId = args.object["roomId"];

        if (!roomId) return false;

        const room = this.roomsService.findRoomById(roomId);

        return room.hostId === userId;
    }

    defaultMessage(): string {
        return "User is not host of room boo";
    }
}

import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";

import { RoomConfigurationInput } from "./room-configuration.input";
import { UserInput } from "./user.input";

export class CreateRoomInput {
    @ValidateNested()
    @Type(() => RoomConfigurationInput)
    room: RoomConfigurationInput;

    @ValidateNested()
    @Type(() => UserInput)
    user: UserInput;
}

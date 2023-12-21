import type { ValidationOptions } from "class-validator";
import { registerDecorator } from "class-validator";

import { IsUserRoomHost as validator } from "./is-user-room-host.validator";

export function IsUserRoomHost(validationOptions?: ValidationOptions) {
    return function (object: unknown, propertyName: string) {
        registerDecorator({
            name: "isUserRoomHost",
            target: object.constructor,
            options: validationOptions,
            propertyName: propertyName,
            validator,
        });
    };
}

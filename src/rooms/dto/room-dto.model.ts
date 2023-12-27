import { Expose } from "class-transformer";
import { RoomState } from "src/model/enum/room-state.enum";

import type { MemberDtoModel } from "./member-dto.model";

export class RoomDtoModel {
    @Expose()
    code: string;

    @Expose()
    isFull: boolean;

    @Expose()
    isLocked: boolean;

    @Expose()
    maxMembers?: number;

    @Expose()
    members: MemberDtoModel[];

    @Expose()
    secret: string;

    @Expose()
    state: RoomState;
}

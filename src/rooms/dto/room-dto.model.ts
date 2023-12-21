import { Expose } from "class-transformer";

export class RoomDtoModel {
    @Expose()
    createdAt: Date;

    @Expose()
    hostId: string;

    @Expose()
    id: string;

    @Expose()
    isLocked: boolean;

    @Expose()
    maxMembers?: number;

    @Expose()
    updatedAt: Date;
}

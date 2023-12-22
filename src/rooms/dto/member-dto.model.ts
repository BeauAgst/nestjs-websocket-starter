import { Expose } from "class-transformer";

export class MemberDtoModel {
    @Expose()
    connected: boolean;

    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    socketId: string;
}

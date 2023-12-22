import { Expose } from "class-transformer";

export class HostDtoModel {
    @Expose()
    connected: boolean;

    @Expose()
    socketId: string;
}

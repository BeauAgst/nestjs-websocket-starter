import { Expose } from "class-transformer";
import { LikeUserStatus } from "src/model/enum/user-status.enum";

export class UserDtoModel {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    socketId: string;

    @Expose()
    status: LikeUserStatus;
}

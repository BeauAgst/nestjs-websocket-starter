import type { LikeUserStatus } from "./enum/user-status.enum";

export interface UserStoreModel {
    createdAt: Date;
    id: string;
    name: string;
    status: LikeUserStatus;
    updatedAt: Date;
}

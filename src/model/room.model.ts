import { User } from "./user.model";

export interface Room {
    createdAt: Date;
    id: string;
    isLocked: boolean;
    maxUsers: number | null;
    updatedAt: Date;
    users: User[];
}

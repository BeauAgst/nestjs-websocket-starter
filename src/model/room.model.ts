import { User } from "./user.model";

export interface Room {
    createdAt: Date;
    id: string;
    host: User;
    maxUsers: number | null;
    passphrase: string;
    updatedAt: Date;
    users: User[];
}

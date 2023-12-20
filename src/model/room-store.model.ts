export interface RoomStoreModel {
    createdAt: Date;
    hostId: string;
    id: string;
    isLocked: boolean;
    maxUsers: number | null;
    updatedAt: Date;
    users: Set<string>;
}

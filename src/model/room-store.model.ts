export interface RoomStoreModel {
    createdAt: Date;
    hostId: string;
    id: string;
    isFull: boolean;
    isLocked: boolean;
    maxMembers: number;
    updatedAt: Date;
    users: Set<string>;
}

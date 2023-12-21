import type { RoomDtoModel } from "../../rooms/dto/room-dto.model";
import type { UserDtoModel } from "../../rooms/dto/user-dto.model";

export type RoomEvents =
    | RoomExitedEvent
    | RoomJoinedEvent
    | RoomMembersUpdatedEvent
    | RoomUpdatedEvent;

export enum EventOperation {
    RoomJoined = "room/joined",
    RoomUpdated = "room/updated",
    RoomExited = "room/exited",
    RoomMembersUpdated = "room_members/updated",
}

export enum RoomExitedReason {
    Kicked = "kicked",
    Left = "left",
    RoomClosed = "room_closed",
}

export interface RoomExitedEvent {
    operation: EventOperation.RoomExited;
    data: {
        reason: RoomExitedReason;
        roomId: string;
    };
}

export interface RoomJoinedEvent {
    operation: EventOperation.RoomJoined;
    data: {
        me: UserDtoModel;
        roomId: string;
        room: RoomDtoModel;
        members: UserDtoModel[];
    };
}

export interface RoomMembersUpdatedEvent {
    operation: EventOperation.RoomMembersUpdated;
    data: {
        roomId: string;
        members: UserDtoModel[];
    };
}

export interface RoomUpdatedEvent {
    operation: EventOperation.RoomUpdated;
    data: {
        roomId: string;
        room: RoomDtoModel;
        members?: UserDtoModel[];
    };
}

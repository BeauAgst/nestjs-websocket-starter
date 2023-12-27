import type { RoomDtoModel } from "src/rooms/dto/room-dto.model";

export type GatewayEvent = RoomExitedEvent | RoomUpdatedEvent;

export enum RoomEvent {
    RoomJoined = "room/joined",
    RoomUpdated = "room/updated",
    RoomExited = "room/exited",
    RoomMembersUpdated = "room_members/updated",
}

export enum RoomExitReason {
    Kicked = "kicked",
    Left = "left",
}

export interface RoomUpdatedEvent {
    operation: RoomEvent.RoomUpdated;
    data: {
        room: RoomDtoModel;
    };
}
export interface RoomExitedEvent {
    operation: RoomEvent.RoomExited;
    data: {
        reason: RoomExitReason;
    };
}

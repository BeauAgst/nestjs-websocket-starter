import type { MemberRoomDtoModel } from "src/rooms/dto/member-room-dto.model";
import type { RoomDtoModel } from "src/rooms/dto/room-dto.model";

import type { UserDtoModel } from "../../rooms/dto/user-dto.model";

export type RoomEventPayload =
    | RoomExitedEvent
    | RoomJoinedEvent
    | RoomMembersUpdatedEvent
    | RoomUpdatedEvent;

export enum RoomEvent {
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
    operation: RoomEvent.RoomExited;
    data: {
        reason: RoomExitedReason;
        roomId: string;
    };
}

export interface RoomJoinedEvent {
    operation: RoomEvent.RoomJoined;
    data: {
        me: UserDtoModel;
        roomId: string;
        room: MemberRoomDtoModel;
        members: UserDtoModel[];
    };
}

export interface RoomMembersUpdatedEvent {
    operation: RoomEvent.RoomMembersUpdated;
    data: {
        roomId: string;
        members: UserDtoModel[];
    };
}

export interface RoomUpdatedEvent {
    operation: RoomEvent.RoomUpdated;
    data: {
        room: RoomDtoModel;
    };
}

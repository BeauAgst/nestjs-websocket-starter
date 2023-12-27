import type { RoomDtoModel } from "../dto/room-dto.model";
import type { Room } from "../schema/room.schema";
import { mapMemberToDto } from "./map-member-to-dto";

export const mapRoomToDto = (room: Room, isHost: boolean): RoomDtoModel => ({
    code: room.code,
    isFull: !!room.maxMembers && room.members.length >= room.maxMembers,
    isLocked: room.isLocked,
    maxMembers: room.maxMembers,
    members: room.members.map((member) => mapMemberToDto(member)),
    secret: isHost ? room.secret : null,
    state: room.state,
});

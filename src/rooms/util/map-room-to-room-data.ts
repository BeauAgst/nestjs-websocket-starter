import type { RoomDataModel } from "src/model/room-data.model";

import type { Member } from "../schema/member.schema";
import type { Room } from "../schema/room.schema";

export const mapRoomToRoomData = (room: Room, socketId: string, member?: Member): RoomDataModel => {
    if (!room) return null;

    return {
        host: room.members.find(({ isHost }) => isHost),
        me: room.members.find((member) => member.socketId === socketId),
        member,
        room,
    };
};

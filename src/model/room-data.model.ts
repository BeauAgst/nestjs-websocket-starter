import type { Member } from "src/rooms/schema/member.schema";
import type { Room } from "src/rooms/schema/room.schema";

export type RoomDataModel = {
    host: Member;
    me: Member;
    member?: Member;
    room: Room;
};

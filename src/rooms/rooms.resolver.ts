import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Room } from "./models/room.model";
import { FindRoomInput } from "./dto/find-room.input";
import { RoomsService } from "./rooms.service";
import { CreateRoomInput } from "./dto/create-room.input";
import { JoinRoomInput } from "./dto/join-room.input";

@Resolver(() => Room)
export class RoomsResolver {
    constructor(private readonly roomsService: RoomsService) {}

    @Mutation(() => Room)
    createRoom(@Args("input") input: CreateRoomInput) {
        return this.roomsService.create(input);
    }

    @Mutation(() => Room, { nullable: true })
    joinRoom(@Args("input") input: JoinRoomInput) {
        return this.roomsService.join(input);
    }

    @Query(() => Room, { nullable: true })
    room(@Args("input") input: FindRoomInput) {
        return this.roomsService.findOne(input);
    }
}

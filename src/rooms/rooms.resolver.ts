import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Room } from "./models/room.model";
import { FindRoomInput } from "./dto/find-room.input";
import { RoomsService } from "./rooms.service";
import { CreateRoomInput } from "./dto/create-room.input";

@Resolver(() => Room)
export class RoomsResolver {
    constructor(private readonly roomsService: RoomsService) {}

    @Mutation(() => Room)
    async createRoom(@Args("input") input: CreateRoomInput) {
        return this.roomsService.create(input);
    }

    @Query(() => Room)
    async room(@Args("input") input: FindRoomInput) {
        return this.roomsService.findOne(input);
    }
}

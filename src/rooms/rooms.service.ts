import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Room } from "./schema/room.schema";
import { FindRoomInput } from "./dto/find-room.input";
import { CreateRoomInput } from "./dto/create-room.input";
import { ConfigService } from "../config/config.service";
import { customAlphabet } from "nanoid";

@Injectable()
export class RoomsService {
    constructor(
        private configService: ConfigService,
        @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    ) {}

    async findOne(input: FindRoomInput): Promise<Room> {
        const { roomId, roomOwnerId } = input;
        return this.roomModel.findOne({ _id: roomId, roomOwnerId }).exec();
    }

    async create(input: CreateRoomInput): Promise<Room> {
        const roomPassphrase = customAlphabet(
            this.configService.roomPassphraseAlphabet,
            this.configService.roomPassphraseLength,
        );

        return this.roomModel.create({
            maxUsers: input.maxUsers,
            passphrase: roomPassphrase(),
            roomOwnerId: input.roomOwnerId,
        });
    }
}

import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { FindRoomInput } from "./dto/find-room.input";
import { CreateRoomInput } from "./dto/create-room.input";
import { ConfigService } from "../config/config.service";
import { mapRoomStoreModelToDto } from "./util/map-room-store-model-to-dto";
import { Room } from "./models/room.model";
import { Room as RoomStoreModel } from "./schema/room.schema";
import { JoinRoomInput } from "./dto/join-room.input";
import { generateRoomPassphrase } from "./util/generate-room-passphrase";
import { mapCreateRoomInputToStoreModel } from "./util/map-create-room-input-to-store-model";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class RoomsService {
    constructor(
        private configService: ConfigService,
        private readonly logger: PinoLogger,
        @InjectModel(Room.name) private readonly roomModel: Model<RoomStoreModel>,
    ) {
        this.logger.setContext(this.constructor.name);
    }

    async create(input: CreateRoomInput): Promise<Room | null> {
        this.logger.info({ userId: input.userId }, "Creating room");
        const createRoomWithUniquePassphrase = async (
            maxAttempts: number,
        ): Promise<Room | null> => {
            if (maxAttempts === 0) {
                return null;
            }

            const passphrase = generateRoomPassphrase(
                this.configService.roomPassphraseAlphabet,
                this.configService.roomPassphraseLength,
            );
            const roomExists = await this.roomModel.exists({ passphrase });

            if (roomExists) {
                return createRoomWithUniquePassphrase(maxAttempts - 1);
            }

            const room = await this.roomModel.create(
                mapCreateRoomInputToStoreModel(input, passphrase),
            );

            return mapRoomStoreModelToDto(room, input.userId);
        };

        return createRoomWithUniquePassphrase(this.configService.roomCreationRetryAttempts);
    }

    async findOne(input: FindRoomInput): Promise<Room | null> {
        const { roomId, userId } = input;

        this.logger.info({ roomId, userId: input.userId }, "Finding room for user");

        const room = await this.roomModel.findOne({ _id: roomId, users: userId }).exec();
        return mapRoomStoreModelToDto(room, userId);
    }

    async join(input: JoinRoomInput): Promise<Room | null> {
        const { passphrase, userId } = input;

        this.logger.info({ userId }, "Joining room for user");

        const existingRoom = await this.roomModel
            .findOne({
                passphrase,
                users: userId,
            })
            .exec();

        if (existingRoom) {
            this.logger.info({ roomId: existingRoom.id, userId }, "User has already joined room");
            return mapRoomStoreModelToDto(existingRoom, userId);
        }

        const updatedRoom = await this.roomModel
            .findOneAndUpdate(
                {
                    passphrase,
                    $expr: {
                        $or: [
                            { $eq: ["$maxUsers", null] },
                            { $lt: [{ $size: "$users" }, "$maxUsers"] },
                        ],
                    },
                },
                {
                    $push: { users: userId },
                    updatedAt: new Date(),
                },
            )
            .exec();

        return mapRoomStoreModelToDto(updatedRoom, userId);
    }
}
import { createMock } from "@golevelup/ts-jest";
import type { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";
import { PinoLogger } from "nestjs-pino";

import { ConfigService } from "../config/config.service";
import type { Room } from "../model/room.model";
import type { User } from "../model/user.model";
import type { CreateRoomInput } from "./dto/create-room.input";
import type { UserInput } from "./dto/user.input";
import { RoomsService } from "./rooms.service";
import { generateRoomId } from "./util/generate-room-id";
import { mapCreateRoomInputToStoreModel } from "./util/map-create-room-input-to-store-model";

jest.mock("./util/generate-room-id");
jest.mock("./util/map-create-room-input-to-store-model");

const mockGenerateRoomId = generateRoomId as jest.Mock;
const MOCK_ROOM_ID = "MOCK_ROOM_ID";

const MOCK_USER_INPUT: UserInput = {
    id: "id",
    name: "name",
    socketId: "socketId",
};

const MOCK_USER: User = {
    id: "id",
    isHost: true,
    name: "name",
    socketId: "socketId",
};

const mockMapCreateRoomInputToStoreModel = mapCreateRoomInputToStoreModel as jest.Mock;
const MOCK_MAPPED_ROOM: Room = {
    createdAt: new Date(),
    id: "MOCK_EXISTING_ROOM_ID",
    isLocked: false,
    maxUsers: 5,
    updatedAt: new Date(),
    users: [MOCK_USER],
};

const mockConfigService = {
    roomIdAlphabet: "a",
    roomIdLength: 4,
};

const mockPinoLogger = createMock;

describe("RoomsService", () => {
    let service: RoomsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoomsService,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: PinoLogger, useValue: mockPinoLogger },
            ],
        }).compile();

        service = module.get(RoomsService);

        mockGenerateRoomId.mockReturnValue(MOCK_ROOM_ID);
        mockMapCreateRoomInputToStoreModel.mockReturnValue(MOCK_MAPPED_ROOM);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("createRoom", () => {
        const TEST_INPUT: CreateRoomInput = {
            user: MOCK_USER_INPUT,
        };

        describe("When a room with the same ID exists", () => {
            let result;

            beforeEach(() => {
                mockGenerateRoomId
                    .mockReturnValueOnce(MOCK_MAPPED_ROOM.id)
                    .mockReturnValueOnce(MOCK_ROOM_ID);

                result = service.createRoom(TEST_INPUT);
            });

            test("should keep generating a room ID until it finds a unique one", () => {
                expect(mockGenerateRoomId).toHaveBeenCalledTimes(2);
            });

            test("should map the input and valid room ID to the Room model", () => {
                expect(mockMapCreateRoomInputToStoreModel).toHaveBeenCalledWith();
            });

            test("should return the created room", () => {
                expect(result).toEqual(MOCK_MAPPED_ROOM);
            });
        });
    });
});

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { MatchService } from '../match/match.service';
import { SocketsGateway } from '../sockets/sockets.gateway';
import {
  NEW_MATCH_STARTED_EVENT,
  NEW_ROOM_AVAILABLE_EVENT,
} from '../sockets/consts/sockets.const';
import { Match } from '../match/entities/match.entity';
import { RoomPrize } from './entities/room-prize.entity';
import { mapToRoomDto } from './dto/room.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,

    @InjectRepository(RoomPrize)
    private readonly roomPrizeRepository: Repository<RoomPrize>,

    @Inject(forwardRef(() => MatchService))
    private readonly matchService: MatchService,

    private readonly socketsGateway: SocketsGateway,
  ) {}

  async create(user: User, createRoomDto: CreateRoomDto): Promise<Room> {
    const room = await this.roomRepository.save({
      ...createRoomDto,
      owner: user,
      roomPrize: new RoomPrize(),
    });

    this.socketsGateway.server.emit(NEW_ROOM_AVAILABLE_EVENT);
    // await this.startMatch(room, createRoomDto.soldCards);

    return this.findOne(room.id);
  }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
  }

  async findOne(id: number, options?: any): Promise<Room> {
    return this.roomRepository.findOne({
      where: { id },
      relations: {
        currentUsers: true,
        matches: true,
        currentMatch: {
          matchNumbers: true,
        },
        roomPrize: true,
        ...(options?.relations || {}),
      },
    });
  }

  async update(id: number, room: Partial<Room>): Promise<Room> {
    if (room.roomPrize) {
      await this.roomPrizeRepository.update(
        { id: room.roomPrize.id },
        room.roomPrize,
      );
    }

    await this.roomRepository.update({ id }, room);
    return this.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }

  async join(roomId: number, user: User): Promise<void> {
    const room = await this.findOne(roomId);
    room.currentUsers.push(user);

    await this.roomRepository.save(room);
  }

  async leave(roomId: number, user: User): Promise<void> {
    const room = await this.findOne(roomId);
    room.currentUsers = room.currentUsers.filter(
      (currentUser) => currentUser.id !== user.id,
    );

    await this.roomRepository.save(room);
  }

  async startMatch(room: Room, soldCards: number): Promise<Match> {
    const match = await this.matchService.create(room, { soldCards });
    room = await this.findOne(room.id);

    this.socketsGateway.server
      .to(room.id.toString())
      .emit(NEW_MATCH_STARTED_EVENT, {
        matchId: match.id,
        room: mapToRoomDto(room),
      });

    return match;
  }

  async closeMatches(roomId: number): Promise<Room> {
    const room = await this.findOne(roomId);
    for await (const match of room.matches) {
      await this.matchService.close(match);
    }

    return this.findOne(roomId);
  }
}

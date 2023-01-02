import {
  CACHE_MANAGER,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { Repository } from 'typeorm';
import { Room } from '../room/entities/room.entity';
import { RoomService } from '../room/room.service';
import { Cache } from 'cache-manager';
import { EXTRACTED_NUMBERS_CACHE_PREFIX } from './consts/match.const';
import { MatchNumber } from './entities/match-number.entity';
import { SocketsGateway } from '../sockets/sockets.gateway';
import {
  BINGO_ONE_STARTED_EVENT,
  EXTRACTED_NUMBERS_EVENT,
} from '../sockets/consts/sockets.const';
import {
  BINGO_BRONZE_PRIZE_EURO,
  BINGO_BRONZE_START_BALLS,
  BINGO_ONE_MIN_MATCHES,
  BINGO_ONE_PRIZE_EURO,
  BINGO_ONE_START_BALLS,
  BINGO_SUPER_PRIZE_EURO,
  BINGO_SUPER_START_BALLS,
} from '../room/consts/room.consts';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchService {
  private readonly logger: Logger = new Logger('MatchService');

  constructor(
    @InjectQueue('matches')
    private readonly matchesQueue: Queue,

    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,

    @InjectRepository(MatchNumber)
    private readonly matchNumberRepository: Repository<MatchNumber>,

    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    private readonly socketsGateway: SocketsGateway,
  ) {
    //
  }

  async addRoomToQueue(
    match: Match,
    roomId: number,
    options?: { delay?: number },
  ): Promise<void> {
    if (options?.delay) {
      const delayPromise = new Promise<void>((resolve, reject) => {
        setTimeout(async () => {
          try {
            await this.matchesQueue.add({ match, roomId });
          } catch (e) {
            reject(e);
          }

          resolve();
        }, options.delay);
      });

      await delayPromise;
      return;
    }

    await this.matchesQueue.add({ match, roomId });
  }

  async extractNumber(match: Match): Promise<number | null> {
    match = await this.findOne(match.id);
    if (match.closed) {
      return null;
    }

    const extractedNumbers =
      match.matchNumbers.map((number) => number.number) || [];

    if (extractedNumbers.length > 90) {
      return null;
    }

    let extractedNumber = null;
    do {
      extractedNumber = Math.floor(Math.random() * (91 - 1) + 1);
    } while (extractedNumbers.includes(extractedNumber));

    this.matchNumberRepository.save({
      match,
      number: extractedNumber,
    });

    this.socketsGateway.server
      .to(match.room.id.toString())
      .emit(EXTRACTED_NUMBERS_EVENT, {
        matchId: match.id,
        number: extractedNumber,
      });

    return extractedNumber;
  }

  async create(room: Room, createMatchDto: CreateMatchDto): Promise<Match> {
    const match = await this.matchRepository.save({
      room,
      soldCars: createMatchDto.soldCards,
    });

    const roomPrize = room.roomPrize;
    roomPrize.oneBalls =
      roomPrize.oneBalls === 0 || roomPrize.oneBalls >= 90
        ? BINGO_ONE_START_BALLS
        : roomPrize.oneBalls + 1;
    roomPrize.onePrice +=
      BINGO_ONE_PRIZE_EURO /*+ room.ticketPrice * createMatchDto.soldCards*/;

    roomPrize.superBalls =
      roomPrize.superBalls === 0 || roomPrize.superBalls >= 90
        ? BINGO_SUPER_START_BALLS
        : roomPrize.superBalls + 1;
    roomPrize.superPrice +=
      BINGO_SUPER_PRIZE_EURO /*+ room.ticketPrice * createMatchDto.soldCards*/;

    roomPrize.bronzeBalls =
      roomPrize.bronzeBalls === 0 || roomPrize.bronzeBalls >= 90
        ? BINGO_BRONZE_START_BALLS
        : roomPrize.bronzeBalls + 1;
    roomPrize.bronzePrice +=
      BINGO_BRONZE_PRIZE_EURO /*+ room.ticketPrice * createMatchDto.soldCards*/;

    room = await this.roomService.update(room.id, {
      currentMatch: match,
      roomPrize,
    });

    if (room.matches.length === BINGO_ONE_MIN_MATCHES) {
      this.socketsGateway.server
        .to(room.id.toString())
        .emit(BINGO_ONE_STARTED_EVENT);
    }

    await this.addRoomToQueue(match, room.id, { delay: 5000 });

    return this.findOne(match.id);
  }

  async close(match: Match | number): Promise<void> {
    await this.matchRepository.update(
      { id: match instanceof Match ? match.id : match },
      { closed: true },
    );
  }

  async start(match: Match | number, room?: number): Promise<void> {
    this.logger.log(
      'Match #' + (match instanceof Match ? match.id : match) + ' is starting',
    );

    await this.matchRepository.update(
      { id: match instanceof Match ? match.id : match },
      { closed: false },
    );

    if (!(match instanceof Match)) {
      const matchInstance = await this.findOne(match);
      await this.addRoomToQueue(matchInstance, room);
    }
  }

  private async findOne(id: number): Promise<Match> {
    return this.matchRepository.findOne({
      where: { id },
      relations: {
        room: true,
        matchNumbers: true,
      },
    });
  }
}

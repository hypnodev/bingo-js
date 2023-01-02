import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { mapToRoomDto, RoomDto } from './dto/room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { TicketPriceDto } from './dto/ticket-price.dto';
import { ResetPrizeDto } from './dto/reset-prize.dto';
import {
  BINGO_BRONZE_START_BALLS,
  BINGO_ONE_START_BALLS,
  BINGO_SUPER_START_BALLS,
} from './consts/room.consts';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @User() user,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<RoomDto> {
    const room = await this.roomService.create(user, createRoomDto);
    return mapToRoomDto(room);
  }

  @Get()
  async findAll(): Promise<RoomDto[]> {
    return this.roomService.findAll().then((rooms) => rooms.map(mapToRoomDto));
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<RoomDto> {
    const room = await this.roomService.findOne(id, {
      relations: { owner: true },
    });
    return mapToRoomDto(room);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }

  @Post(':id/ticket-price')
  async ticketPrice(
    @Param('id') id: number,
    @Body() ticketPriceDto: TicketPriceDto,
  ): Promise<RoomDto> {
    const room = await this.roomService.update(id, {
      ticketPrice: +ticketPriceDto.ticketPrice,
    });
    return mapToRoomDto(room);
  }

  @Post(':id/reset-prize')
  async resetPrize(
    @Param('id') id: number,
    @Body() resetPrizeDto: ResetPrizeDto,
  ): Promise<RoomDto> {
    await this.roomService.closeMatches(id);
    let room = await this.roomService.findOne(id);

    const roomPrize = room.roomPrize;
    switch (resetPrizeDto.prizeToReset) {
      case 'bingo-one':
        roomPrize.onePrice = 0;
        roomPrize.oneBalls = BINGO_ONE_START_BALLS;
        break;
      case 'super-bingo':
        roomPrize.superPrice = 0;
        roomPrize.superBalls = BINGO_SUPER_START_BALLS;
        break;
      case 'bingo-bronze':
        roomPrize.bronzePrice = 0;
        roomPrize.bronzeBalls = BINGO_BRONZE_START_BALLS;
        break;
    }

    room = await this.roomService.update(id, { roomPrize });
    return mapToRoomDto(room);
  }
}

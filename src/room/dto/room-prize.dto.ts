import { RoomPrize } from '../entities/room-prize.entity';

export class RoomPrizeDto {
  onePrice: number;
  oneBalls: number;
  superPrice: number;
  superBalls: number;
  bronzePrice: number;
  bronzeBalls: number;
}

export function mapToRoomPrizeDto(roomPrize: RoomPrize): RoomPrizeDto {
  return {
    onePrice: roomPrize.onePrice,
    oneBalls: roomPrize.oneBalls,
    superPrice: roomPrize.superPrice,
    superBalls: roomPrize.superBalls,
    bronzePrice: roomPrize.bronzePrice,
    bronzeBalls: roomPrize.bronzeBalls,
  };
}

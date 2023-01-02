import { Room } from '../entities/room.entity';
import { mapToMatchDto, MatchDto } from '../../match/dto/match.dto';
import { mapToRoomPrizeDto, RoomPrizeDto } from './room-prize.dto';
import { mapToUserDto, UserDto } from '../../user/dto/user.dto';

export class RoomDto {
  id: number;
  name: string;
  ticketPrice: number;
  currentMatch: MatchDto;
  roomPrize: RoomPrizeDto;
  currentUsers: UserDto[];
  owner: UserDto;

  matches: MatchDto[];
}

export function mapToRoomDto(room: Room): RoomDto {
  return {
    id: room.id,
    name: room.name,
    ticketPrice: room.ticketPrice,
    currentMatch: room.currentMatch ? mapToMatchDto(room.currentMatch) : null,
    roomPrize: mapToRoomPrizeDto(room.roomPrize),
    currentUsers: room.currentUsers?.map(mapToUserDto) || [],
    owner: room.owner ? mapToUserDto(room.owner) : undefined,
    matches: room.matches ? room.matches.map(mapToMatchDto) : undefined,
  };
}

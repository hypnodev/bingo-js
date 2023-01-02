import { mapToMatchNumberDto, MatchNumberDto } from "./match-number.dto";
import { Match } from "../entities/match.entity";

export class MatchDto {
  id: number;
  closed: boolean;
  soldCards: number;
  matchNumbers: MatchNumberDto[];
}

export function mapToMatchDto(match: Match): MatchDto {
  return {
    id: match.id,
    closed: match.closed,
    soldCards: match.soldCards,
    matchNumbers: match.matchNumbers?.map(mapToMatchNumberDto) || [],
  };
}

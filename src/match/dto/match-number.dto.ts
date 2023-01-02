import { MatchNumber } from '../entities/match-number.entity';

export class MatchNumberDto {
  number: number;
}

export function mapToMatchNumberDto(matchNumber: MatchNumber): MatchNumberDto {
  return {
    number: matchNumber.number,
  };
}

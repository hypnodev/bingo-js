import { IsNumber } from 'class-validator';

export class CreateMatchDto {
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 0 })
  soldCards: number;
}

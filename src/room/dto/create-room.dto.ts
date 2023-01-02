import { IsNumber, IsString, Length, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @IsString()
  @Length(1, 20)
  name: string;
}

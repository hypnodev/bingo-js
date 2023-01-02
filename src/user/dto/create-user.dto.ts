import { IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1)
  username: string;

  @IsString()
  @Length(1)
  password: string;
}

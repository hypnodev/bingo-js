import { mapToUserDto, UserDto } from '../../user/dto/user.dto';
import { User } from '../../user/entities/user.entity';

export class AuthDto {
  user: UserDto;
  access_token: string;
}

export function mapToAuthDto(user: User, accessToken: string): AuthDto {
  return {
    user: mapToUserDto(user),
    access_token: accessToken,
  };
}

import { User } from '../entities/user.entity';

export class UserDto {
  id: number;

  username: string;
}

export function mapToUserDto(user: User): UserDto {
  return {
    id: user.id,
    username: user.username,
  };
}

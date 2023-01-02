import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ user; accessToken }> {
    const user = await this.validateUser(loginDto.username, loginDto.password)
    if (user === null) {
      return null;
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });
    return { user, accessToken };
  }

  async register(loginDto: LoginDto): Promise<{ user; accessToken }> {
    let user = await this.userService.findByUsername(loginDto.username);
    if (user !== null) {
      return null;
    }

    user = await this.userService.create(loginDto);

    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    });
    return { user, accessToken };
  }

  async me(id: number): Promise<User> {
    const me = await this.userService.findOne(id);
    return me;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userService.findByUsername(username);
    if (user === null) {
      return null;
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return null;
    }

    return user;
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthDto, mapToAuthDto } from './dto/auth.dto';
import { mapToUserDto, UserDto } from '../user/dto/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthDto> {
    const login = await this.authService.login(loginDto);
    if (login === null) {
      throw new UnauthorizedException();
    }

    return mapToAuthDto(login.user, login.accessToken);
  }

  @Post('register')
  async register(@Body() loginDto: LoginDto): Promise<AuthDto> {
    const login = await this.authService.register(loginDto);
    if (login === null) {
      throw new UnauthorizedException();
    }

    return mapToAuthDto(login.user, login.accessToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@User() user): Promise<UserDto> {
    const me = await this.authService.me(user.id);
    return mapToUserDto(me);
  }
}

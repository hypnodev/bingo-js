import { forwardRef, Module } from '@nestjs/common';
import { SocketsGateway } from './sockets.gateway';
import { RoomModule } from '../room/room.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [
    forwardRef(() => RoomModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    forwardRef(() => MatchModule),
  ],
  providers: [SocketsGateway],
  exports: [SocketsGateway],
})
export class SocketsModule {}

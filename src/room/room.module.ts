import { forwardRef, Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { MatchModule } from '../match/match.module';
import { SocketsModule } from '../sockets/sockets.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RoomPrize } from "./entities/room-prize.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomPrize]),
    forwardRef(() => MatchModule),
    SocketsModule,
    AuthModule,
    UserModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}

import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MatchService } from './match.service';
import { MatchesConsumer } from './consumers/matches.consumer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { MatchNumber } from './entities/match-number.entity';
import { RoomModule } from '../room/room.module';
import { SocketsModule } from '../sockets/sockets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, MatchNumber]),
    BullModule.registerQueue({
      name: 'matches',
    }),
    forwardRef(() => RoomModule),
    SocketsModule,
  ],
  providers: [MatchService, MatchesConsumer],
  exports: [MatchService],
})
export class MatchModule {}

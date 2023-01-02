import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { forwardRef, Inject, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RoomService } from '../room/room.service';
import { WsGuard } from '../auth/guards/ws.guard';
import { User } from '../user/entities/user.entity';
import {
  NEW_MATCH_EVENT,
  ON_ENTER_ROOM_EVENT,
  ON_EXIT_ROOM_EVENT,
  PAUSE_MATCH_EVENT,
  PLAY_MATCH_EVENT,
  PLAYER_JOINED_EVENT,
} from './consts/sockets.const';
import { MatchService } from '../match/match.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;
  private readonly logger: Logger = new Logger('SocketsGateway');

  constructor(
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,

    @Inject(forwardRef(() => MatchService))
    private readonly matchService: MatchService,
  ) {
    //
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(ON_ENTER_ROOM_EVENT)
  async handleOnEnteredRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: number,
    @MessageBody('user') user: User,
  ): Promise<void> {
    await this.roomService.join(roomId, user);

    await client.join(roomId.toString());

    this.server
      .to(roomId.toString())
      .emit(PLAYER_JOINED_EVENT, { username: user.username });

    client.on('disconnect', () => {
      this.handleOnExitRoom(client, roomId, user);
    });
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(ON_EXIT_ROOM_EVENT)
  async handleOnExitRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: number,
    @MessageBody('user') user: User,
  ): Promise<void> {
    //await client.leave(roomId.toString());
    await this.roomService.leave(roomId, user);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(NEW_MATCH_EVENT)
  async handleNewMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody('roomId') roomId: number,
    @MessageBody('soldCards') soldCards: number,
    @MessageBody('user') user: User,
  ): Promise<void> {
    this.logger.log(`Room ${roomId} is starting a new match`);

    const room = await this.roomService.closeMatches(roomId);
    await this.roomService.startMatch(room, soldCards);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(PLAY_MATCH_EVENT)
  async handlePlayMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody('matchId') matchId: number,
    @MessageBody('matchId') roomId: number,
    @MessageBody('user') user: User,
  ): Promise<void> {
    await this.matchService.start(matchId, roomId);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage(PAUSE_MATCH_EVENT)
  async handlePauseMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody('matchId') matchId: number,
    @MessageBody('user') user: User,
  ): Promise<void> {
    await this.matchService.close(matchId);
  }

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]): any {
    this.logger.log(`Client is connected! ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket, ...args: any[]): any {
    this.logger.log(`Client is disconnected! ${client.id}`);
  }
}

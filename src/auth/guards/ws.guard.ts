import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';

@Injectable()
export class WsGuard implements CanActivate {
  private readonly logger: Logger = new Logger('SocketsGateway');

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const bearerToken = context.getArgByIndex(0).handshake.auth.Bearer;

    const decoded = this.jwtService.verify(bearerToken);
    return new Promise(async (resolve, reject) => {
      const user = await this.userService.findOne(decoded.sub);
      if (user) {
        context.switchToWs().getData().user = user;
        return resolve(user);
      }

      return reject(null);
    });
  }
}

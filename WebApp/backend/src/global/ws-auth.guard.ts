import { CanActivate, Injectable } from '@nestjs/common';

@Injectable()
export class WsGuard implements CanActivate {
  constructor() {}

  canActivate(context: any): boolean | any | Promise<boolean | any> {
    // TODO add logic here for authenticating
    return true;
  }
}

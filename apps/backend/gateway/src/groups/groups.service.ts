import { GROUP_SERVICE } from '@limbo/groups-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class GroupsService {
  constructor(@Inject(GROUP_SERVICE) private readonly GroupClient: ClientProxy) {}
}

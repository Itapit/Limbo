import { GroupDto } from '@limbo/common';
import { GROUP_SERVICE, GROUPS_PATTERNS } from '@limbo/groups-contracts';
import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddMemberDto, CreateGroupDto, UpdateGroupDto } from './dtos';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(@Inject(GROUP_SERVICE) private readonly groupsClient: ClientProxy) {}

  @Post()
  async create(@Body() dto: CreateGroupDto, @Req() req): Promise<GroupDto> {
    const payload = {
      ...dto,
      ownerId: req.user.userId,
    };

    return firstValueFrom(this.groupsClient.send<GroupDto>(GROUPS_PATTERNS.CREATE, payload));
  }

  @Get('my-groups')
  async findMyGroups(@Req() req): Promise<GroupDto[]> {
    return firstValueFrom(this.groupsClient.send<GroupDto[]>(GROUPS_PATTERNS.FIND_MY_GROUPS, req.user.userId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<GroupDto> {
    return firstValueFrom(this.groupsClient.send<GroupDto>(GROUPS_PATTERNS.FIND_ONE, id));
  }

  @Patch(':id')
  async update(@Param('id') groupId: string, @Body() dto: UpdateGroupDto, @Req() req): Promise<GroupDto> {
    const payload = {
      groupId,
      actorId: req.user.userId,
      ...dto,
    };

    return firstValueFrom(this.groupsClient.send<GroupDto>(GROUPS_PATTERNS.UPDATE, payload));
  }

  @Post(':id/members')
  async addMember(@Param('id') groupId: string, @Body() addMemberDto: AddMemberDto, @Req() req): Promise<GroupDto> {
    const payload = {
      groupId,
      actorId: req.user.userId,
      targetUserId: addMemberDto.targetUserId,
    };

    return firstValueFrom(this.groupsClient.send<GroupDto>(GROUPS_PATTERNS.ADD_MEMBER, payload));
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') groupId: string,
    @Param('userId') targetUserId: string,
    @Req() req
  ): Promise<GroupDto> {
    const payload = {
      groupId,
      actorId: req.user.userId,
      targetUserId,
    };

    return firstValueFrom(this.groupsClient.send<GroupDto>(GROUPS_PATTERNS.REMOVE_MEMBER, payload));
  }

  @Delete(':id')
  async delete(@Param('id') groupId: string, @Req() req): Promise<boolean> {
    const payload = {
      groupId,
      actorId: req.user.userId,
    };

    return firstValueFrom(this.groupsClient.send<boolean>(GROUPS_PATTERNS.DELETE, payload));
  }
}

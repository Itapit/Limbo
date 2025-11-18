import {
  AddMemberPayload,
  CheckGroupMembershipPayload,
  CreateGroupPayload,
  DeleteGroupPayload,
  RemoveMemberPayload,
  UpdateGroupPayload,
} from '@limbo/groups-contracts';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateGroupRepoDto } from './dtos/create-group-repo.dto';
import { GroupRepository } from './repository/group.repository';
import { GroupSchema } from './repository/group.schema';

@Injectable()
export class GroupsService {
  constructor(private readonly groupRepository: GroupRepository) {}

  /**
   * Create a new group.
   */
  async create(payload: CreateGroupPayload): Promise<GroupSchema> {
    const ownerObjectId = new Types.ObjectId(payload.ownerId);

    const repoParams: CreateGroupRepoDto = {
      name: payload.name,
      description: payload.description,
      ownerId: ownerObjectId,
      members: [ownerObjectId], // Owner is automatically a member
    };

    return this.groupRepository.create(repoParams);
  }

  /**
   * Find a specific group.
   */
  async findOne(id: string): Promise<GroupSchema> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Group ID');
    }

    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  /**
   * Find all groups a user belongs to.
   */
  async findMyGroups(userId: string): Promise<GroupSchema[]> {
    return this.groupRepository.findByMemberId(userId);
  }

  /**
   * Add a member to a group.
   */
  async addMember(payload: AddMemberPayload): Promise<GroupSchema> {
    const group = await this.findOne(payload.groupId);

    if (group.ownerId.toString() !== payload.actorId) {
      throw new ForbiddenException('Only the group owner can add members');
    }

    const updatedGroup = await this.groupRepository.addMember(payload.groupId, payload.targetUserId);
    if (!updatedGroup) {
      throw new NotFoundException('Group not found during member addition');
    }

    return updatedGroup;
  }

  /**
   * Remove a member from a group.
   */
  async removeMember(payload: RemoveMemberPayload): Promise<GroupSchema> {
    const group = await this.findOne(payload.groupId);

    const isOwner = group.ownerId.toString() === payload.actorId;
    const isSelf = payload.targetUserId === payload.actorId;

    if (!isOwner && !isSelf) {
      throw new ForbiddenException('You do not have permission to remove this member');
    }

    if (isOwner && isSelf) {
      throw new BadRequestException('Owner cannot leave the group. Delete the group instead.');
    }

    const updatedGroup = await this.groupRepository.removeMember(payload.groupId, payload.targetUserId);
    if (!updatedGroup) {
      throw new NotFoundException('Group not found during member removal');
    }
    return updatedGroup;
  }

  /**
   * Update group details.
   */
  async update(payload: UpdateGroupPayload): Promise<GroupSchema> {
    const group = await this.findOne(payload.groupId);

    // Permission Check: Is the actor the owner?
    if (group.ownerId.toString() !== payload.actorId) {
      throw new ForbiddenException('Only the owner can update group details');
    }

    // We pass the payload directly, as it matches Partial<Group> structure for name/desc
    const updated = await this.groupRepository.update(payload.groupId, {
      name: payload.name,
      description: payload.description,
    });

    if (!updated) {
      throw new NotFoundException('Group not found during update');
    }
    return updated;
  }

  /**
   * Delete a group.
   */
  async delete(payload: DeleteGroupPayload): Promise<boolean> {
    const group = await this.findOne(payload.groupId);

    if (group.ownerId.toString() !== payload.actorId) {
      throw new ForbiddenException('Only the owner can delete the group');
    }

    return this.groupRepository.delete(payload.groupId);
  }

  /**
   * Internal Microservice Helper
   */
  async isUserInGroup(payload: CheckGroupMembershipPayload): Promise<boolean> {
    if (!Types.ObjectId.isValid(payload.groupId) || !Types.ObjectId.isValid(payload.userId)) {
      return false;
    }
    return this.groupRepository.isUserInGroup(payload.groupId, payload.userId);
  }
}

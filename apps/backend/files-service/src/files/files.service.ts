import { FileDto, FileStatus } from '@limbo/common';
import { CreateFolderPayload, InitUploadPayload } from '@limbo/files-contracts';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { CreateFileRepoDto } from './dtos/create-file-repo.dto';
import { FileEntity } from './repository/file.entity';
import { FileRepository } from './repository/file.repository';

@Injectable()
export class FilesService {
  constructor(private readonly fileRepository: FileRepository, private readonly storageService: StorageService) {}

  async initializeUpload(userId: string, payload: InitUploadPayload) {
    const fileKey = `${uuidv4()}${extname(payload.filename)}`;
    const uploadUrl = await this.storageService.getPresignedPutUrl(fileKey);

    const repoDto: CreateFileRepoDto = {
      key: fileKey,
      originalName: payload.filename,
      mimeType: payload.mimetype,
      ownerId: userId,
      status: FileStatus.PENDING,
      isFolder: false,
      parentId: payload.parentId || null,
      size: 0,
    };

    const file = await this.fileRepository.create(repoDto);

    return {
      fileId: file.id,
      uploadUrl,
      key: fileKey,
    };
  }

  async confirmUpload(userId: string, fileId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId !== userId) throw new ForbiddenException('Access denied');

    return this.fileRepository.updateStatus(fileId, FileStatus.UPLOADED);
  }

  async createFolder(userId: string, payload: CreateFolderPayload) {
    const repoDto: CreateFileRepoDto = {
      originalName: payload.name,
      ownerId: userId,
      isFolder: true,
      status: FileStatus.COMPLETED,
      parentId: payload.parentId || null,
      key: undefined,
      mimeType: undefined,
      size: 0,
    };

    return this.fileRepository.create(repoDto);
  }

  async listContents(userId: string, parentId?: string) {
    const files = await this.fileRepository.findByParent(userId, parentId || null);
    return files.map((f) => this.mapToDto(f));
  }

  async getDownloadLink(userId: string, fileId: string, userGroupIds: string[] = []) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');

    const isOwner = file.ownerId === userId;
    const isSharedWithUser = file.sharedWithUsers.includes(userId);
    // Check intersection: Does the file's allowed groups contain any of the user's groups?
    const isSharedWithGroup = file.sharedWithGroups.some((allowedGroupId) => userGroupIds.includes(allowedGroupId));

    const hasAccess = isOwner || isSharedWithUser || isSharedWithGroup;

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to view this file');
    }

    if (file.isFolder) throw new BadRequestException('Cannot download a folder directly');

    if (!file.key) throw new InternalServerErrorException('File record exists but has no storage key');

    const downloadUrl = await this.storageService.getPresignedGetUrl(file.key);
    return { downloadUrl, metadata: this.mapToDto(file) };
  }

  async deleteFile(userId: string, fileId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId !== userId) throw new ForbiddenException('Only the owner can delete files');

    if (file.isFolder) {
      // Recursive delete: find all children and delete them too
      const children = await this.fileRepository.findByParent(userId, fileId);
      for (const child of children) {
        await this.deleteFile(userId, child.id); // Recursive call
      }
    } else {
      if (file.key) {
        await this.storageService.delete(file.key);
      }
    }

    // Finally delete the record itself (file or folder)
    await this.fileRepository.delete(fileId);

    return { success: true };
  }

  // --- Sharing Logic ---

  async shareFileWithUser(ownerId: string, fileId: string, targetUserId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId !== ownerId) throw new ForbiddenException('Only the owner can share this file');

    // Update the target file/folder itself
    const updated = await this.fileRepository.shareWithUser(fileId, targetUserId);
    if (!updated) throw new NotFoundException('File not found during update');

    // Propagate if folder
    if (file.isFolder) {
      await this.propagatePermission(ownerId, file.id, targetUserId, 'user', 'add');
    }

    return this.mapToDto(updated);
  }

  async unshareFileWithUser(ownerId: string, fileId: string, targetUserId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId !== ownerId) throw new ForbiddenException('Only the owner can unshare this file');

    const updated = await this.fileRepository.unshareWithUser(fileId, targetUserId);
    if (!updated) throw new NotFoundException('File not found during update');

    if (file.isFolder) {
      await this.propagatePermission(ownerId, file.id, targetUserId, 'user', 'remove');
    }

    return this.mapToDto(updated);
  }

  async shareFileWithGroup(ownerId: string, fileId: string, groupId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId !== ownerId) throw new ForbiddenException('Only the owner can share this file');

    const updated = await this.fileRepository.shareWithGroup(fileId, groupId);
    if (!updated) throw new NotFoundException('File not found during update');

    if (file.isFolder) {
      await this.propagatePermission(ownerId, file.id, groupId, 'group', 'add');
    }

    return this.mapToDto(updated);
  }

  async unshareFileWithGroup(ownerId: string, fileId: string, groupId: string) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('File not found');
    if (file.ownerId !== ownerId) throw new ForbiddenException('Only the owner can unshare this file');

    const updated = await this.fileRepository.unshareWithGroup(fileId, groupId);
    if (!updated) throw new NotFoundException('File not found during update');

    if (file.isFolder) {
      await this.propagatePermission(ownerId, file.id, groupId, 'group', 'remove');
    }

    return this.mapToDto(updated);
  }

  private async propagatePermission(
    ownerId: string,
    parentId: string,
    targetId: string,
    type: 'user' | 'group',
    action: 'add' | 'remove'
  ) {
    // Find immediate children
    const children = await this.fileRepository.findByParent(ownerId, parentId);

    for (const child of children) {
      // Apply the action to the child
      if (type === 'user') {
        if (action === 'add') {
          await this.fileRepository.shareWithUser(child.id, targetId);
        } else {
          await this.fileRepository.unshareWithUser(child.id, targetId);
        }
      } else {
        // Group type
        if (action === 'add') {
          await this.fileRepository.shareWithGroup(child.id, targetId);
        } else {
          await this.fileRepository.unshareWithGroup(child.id, targetId);
        }
      }

      // If the child is also a folder, continue recursing down
      if (child.isFolder) {
        await this.propagatePermission(ownerId, child.id, targetId, type, action);
      }
    }
  }

  private mapToDto(file: FileEntity): FileDto {
    return {
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      status: file.status,
      ownerId: file.ownerId,
      isFolder: file.isFolder,
      parentId: file.parentId || null,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }
}

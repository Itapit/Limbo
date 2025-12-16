import { PermissionRole } from '@LucidRF/common';
import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AccessLevel, ResourceType } from '../domain/enums';
import { FileEntity } from '../domain/file.entity';
import { FileRepository } from '../domain/file.repository';
import { FolderEntity } from '../domain/folder.entity';
import { FolderRepository } from '../domain/folder.repository';
import { Permission } from '../domain/permission.entity';
//TODO add p-limit / bulk updates in the repo / Transaction support
@Injectable()
export class AclService {
  private readonly logger = new Logger(AclService.name);

  constructor(private readonly fileRepository: FileRepository, private readonly folderRepository: FolderRepository) {}

  /**
   * Fetches a resource by ID and Type.
   */
  async getResource(resourceId: string, type: ResourceType) {
    const repo = type === ResourceType.FILE ? this.fileRepository : this.folderRepository;
    const resource = await repo.findById(resourceId);

    if (!resource) {
      throw new NotFoundException(`${type} ${resourceId} not found`);
    }

    return resource;
  }

  /**
   * Validates if a user has the required access level for a resource.
   * Returns the resource if successful.
   */
  async validateAccess(
    resourceId: string,
    userId: string,
    type: ResourceType,
    requiredLevel: AccessLevel = AccessLevel.VIEWER
  ) {
    const resource = await this.getResource(resourceId, type);

    if (resource.ownerId === userId) {
      return resource;
    }

    const userPerm = resource.permissions.find((p) => p.subjectId === userId);

    if (!userPerm) {
      throw new ForbiddenException('Access denied');
    }

    // Compare Weights (Role Validation)
    const requiredWeight = this.getWeight(requiredLevel);
    const userWeight = this.getWeight(userPerm.role);

    if (userWeight < requiredWeight) {
      throw new ForbiddenException(`Insufficient permissions: Required ${requiredLevel}, but you are ${userPerm.role}`);
    }

    return resource;
  }

  async propagatePermissionChange(folderId: string, ownerId: string, permission: Permission, action: 'ADD' | 'REMOVE') {
    this.logger.log(`Starting propagation (${action}) for folder ${folderId}`);

    const [subFolders, files] = await Promise.all([
      this.folderRepository.findSubFolders(folderId, ownerId),
      this.fileRepository.findByFolder(folderId, ownerId),
    ]);

    await Promise.all([
      this.propagateToFiles(files, permission, action),
      this.propagateToFolders(subFolders, ownerId, permission, action),
    ]);

    this.logger.debug(`Finished propagation for folder ${folderId}`);
  }

  /**
   * Helper: Iterates over File Entities and applies updates via Repository.
   */
  private async propagateToFiles(files: FileEntity[], permission: Permission, action: 'ADD' | 'REMOVE'): Promise<void> {
    const operations = files.map((file) => {
      const fileId = file._id.toString();

      if (action === 'ADD') {
        return this.shouldUpgrade(file.permissions, permission)
          ? this.fileRepository.addPermission(fileId, permission)
          : Promise.resolve();
      } else {
        return this.fileRepository.removePermission(fileId, permission.subjectId, permission.subjectType);
      }
    });

    await Promise.all(operations);
  }

  /**
   * Iterates over Folder Entities, updates them, and Recurses.
   */
  private async propagateToFolders(
    folders: FolderEntity[],
    ownerId: string,
    permission: Permission,
    action: 'ADD' | 'REMOVE'
  ): Promise<void> {
    const operations = folders.map(async (folder) => {
      const folderId = folder._id.toString();

      if (action === 'ADD') {
        if (this.shouldUpgrade(folder.permissions, permission)) {
          await this.folderRepository.addPermission(folderId, permission);
        }
      } else {
        await this.folderRepository.removePermission(folderId, permission.subjectId, permission.subjectType);
      }

      await this.propagatePermissionChange(folderId, ownerId, permission, action);
    });

    await Promise.all(operations);
  }

  private shouldUpgrade(currentPermissions: Permission[], newPermission: Permission): boolean {
    const existing = currentPermissions.find(
      (p) => p.subjectId === newPermission.subjectId && p.subjectType === newPermission.subjectType
    );
    if (!existing) return true;

    return this.getWeight(newPermission.role) > this.getWeight(existing.role);
  }

  /**
   * Safe Accessor for Weights.
   */
  private getWeight(role: AccessLevel | PermissionRole): number {
    switch (role) {
      case AccessLevel.OWNER:
        return 3;

      case AccessLevel.EDITOR:
      case PermissionRole.EDITOR:
        return 2;

      case AccessLevel.VIEWER:
      case PermissionRole.VIEWER:
        return 1;

      default:
        return 0;
    }
  }
}

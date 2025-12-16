import { Permission } from '../entities/permission.entity';

export class CreateFolderRepoDto {
  name: string;
  ownerId: string;
  parentFolderId: string | null;
  permissions: Permission[];
}

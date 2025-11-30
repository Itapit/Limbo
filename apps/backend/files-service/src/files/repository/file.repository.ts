import { CreateFileRepoDto } from '../dtos/create-file-repo.dto';
import { FileEntity } from './file.entity';

export abstract class FileRepository {
  abstract create(file: CreateFileRepoDto): Promise<FileEntity>;
  abstract findById(id: string): Promise<FileEntity | null>;
  abstract findByKey(key: string): Promise<FileEntity | null>;
  abstract updateStatus(id: string, status: string): Promise<FileEntity | null>;
  abstract findByParent(ownerId: string, parentId: string | null): Promise<FileEntity[]>;
  abstract shareWithUser(fileId: string, userId: string): Promise<FileEntity | null>;
  abstract unshareWithUser(fileId: string, userId: string): Promise<FileEntity | null>;
  abstract shareWithGroup(fileId: string, groupId: string): Promise<FileEntity | null>;
  abstract unshareWithGroup(fileId: string, groupId: string): Promise<FileEntity | null>;
  abstract delete(id: string): Promise<void>;
}

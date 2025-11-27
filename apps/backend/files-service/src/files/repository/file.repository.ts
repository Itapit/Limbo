import { FileSchema } from './file.schema';

export abstract class FileRepository {
  abstract create(file: Partial<FileSchema>): Promise<FileSchema>;
  abstract findByKey(key: string): Promise<FileSchema | null>;
  abstract updateStatus(key: string, status: string): Promise<FileSchema | null>;
  abstract findByOwner(ownerId: string): Promise<FileSchema[]>;
}

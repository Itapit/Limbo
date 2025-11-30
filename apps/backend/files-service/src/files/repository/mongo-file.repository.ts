import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateFileRepoDto } from '../dtos/create-file-repo.dto';
import { FileEntity } from './file.entity';
import { FileRepository } from './file.repository';
import { FileDocument, FileSchema } from './file.schema';

@Injectable()
export class MongoFileRepository implements FileRepository {
  constructor(
    @InjectModel(FileSchema.name)
    private readonly fileModel: Model<FileDocument>
  ) {}

  private map(doc: FileDocument): FileEntity {
    return new FileEntity({
      id: doc._id.toString(),
      key: doc.key,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      ownerId: doc.ownerId,
      status: doc.status,
      isFolder: doc.isFolder,
      parentId: doc.parentId ? doc.parentId.toString() : null,
      size: doc.size,
      sharedWithUsers: doc.sharedWithUsers,
      sharedWithGroups: doc.sharedWithGroups,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async create(file: CreateFileRepoDto): Promise<FileEntity> {
    const newFile = new this.fileModel(file);
    const saved = await newFile.save();
    return this.map(saved);
  }

  async findById(id: string): Promise<FileEntity | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.fileModel.findById(id).exec();
    return doc ? this.map(doc) : null;
  }

  async findByKey(key: string): Promise<FileEntity | null> {
    const doc = await this.fileModel.findOne({ key }).exec();
    return doc ? this.map(doc) : null;
  }

  async findByParent(ownerId: string, parentId: string | null): Promise<FileEntity[]> {
    const query: FilterQuery<FileDocument> = { ownerId };
    if (parentId && Types.ObjectId.isValid(parentId)) {
      query.parentId = new Types.ObjectId(parentId);
    } else {
      query.parentId = null;
    }

    const docs = await this.fileModel.find(query).sort({ isFolder: -1, originalName: 1 }).exec();

    return docs.map((doc) => this.map(doc));
  }

  async updateStatus(id: string, status: string): Promise<FileEntity | null> {
    const doc = await this.fileModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    return doc ? this.map(doc) : null;
  }

  async shareWithUser(fileId: string, userId: string): Promise<FileEntity | null> {
    const doc = await this.fileModel
      .findByIdAndUpdate(fileId, { $addToSet: { sharedWithUsers: userId } }, { new: true })
      .exec();
    return doc ? this.map(doc) : null;
  }

  async unshareWithUser(fileId: string, userId: string): Promise<FileEntity | null> {
    const doc = await this.fileModel
      .findByIdAndUpdate(fileId, { $pull: { sharedWithUsers: userId } }, { new: true })
      .exec();
    return doc ? this.map(doc) : null;
  }

  async shareWithGroup(fileId: string, groupId: string): Promise<FileEntity | null> {
    const doc = await this.fileModel
      .findByIdAndUpdate(fileId, { $addToSet: { sharedWithGroups: groupId } }, { new: true })
      .exec();
    return doc ? this.map(doc) : null;
  }

  async unshareWithGroup(fileId: string, groupId: string): Promise<FileEntity | null> {
    const doc = await this.fileModel
      .findByIdAndUpdate(fileId, { $pull: { sharedWithGroups: groupId } }, { new: true })
      .exec();
    return doc ? this.map(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.fileModel.findByIdAndDelete(id).exec();
  }
}

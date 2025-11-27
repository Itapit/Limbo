import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileRepository } from './file.repository';
import { FileDocument, FileSchema } from './file.schema';

@Injectable()
export class MongoFileRepository implements FileRepository {
  constructor(@InjectModel(FileSchema.name) private readonly fileModel: Model<FileDocument>) {}

  async create(file: Partial<FileSchema>): Promise<FileSchema> {
    const newFile = new this.fileModel(file);
    return newFile.save();
  }

  async findByKey(key: string): Promise<FileSchema | null> {
    return this.fileModel.findOne({ key }).exec();
  }

  async updateStatus(key: string, status: string): Promise<FileSchema | null> {
    return this.fileModel.findOneAndUpdate({ key }, { status }, { new: true }).exec();
  }

  async findByOwner(ownerId: string): Promise<FileSchema[]> {
    return this.fileModel.find({ ownerId }).sort({ createdAt: -1 }).exec();
  }
}

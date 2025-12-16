import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { StorageModule } from '../storage/storage.module';
import { FileRepository, FolderRepository } from './domain/repositories';
import { FilesController } from './files.controller';
import { MongoFileRepository, MongoFolderRepository } from './infrastructure/repositories';
import { FileSchema, FileSchemaFactory, FolderSchema, FolderSchemaFactory } from './infrastructure/schemas';
import { AclService, FileService, FolderService, SharingService } from './services';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    MongooseModule.forFeature([
      { name: FileSchema.name, schema: FileSchemaFactory },
      { name: FolderSchema.name, schema: FolderSchemaFactory },
    ]),
  ],
  controllers: [FilesController],
  providers: [
    SharingService,
    FileService,
    FolderService,
    AclService,
    {
      provide: FileRepository,
      useClass: MongoFileRepository,
    },
    {
      provide: FolderRepository,
      useClass: MongoFolderRepository,
    },
  ],
})
export class FilesModule {}

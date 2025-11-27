import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileRepository } from './repository/file.repository';
import { FileSchema, FileSchemaFactory } from './repository/file.schema';
import { MongoFileRepository } from './repository/mongo-file.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: FileSchema.name, schema: FileSchemaFactory }])],
  controllers: [FilesController],
  providers: [
    FilesService,
    {
      provide: FileRepository,
      useClass: MongoFileRepository,
    },
  ],
})
export class FilesModule {}

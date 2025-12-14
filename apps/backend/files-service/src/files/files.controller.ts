import {
  ConfirmUploadPayload,
  CreateFolderPayload,
  DeleteResourcePayload,
  GetContentPayload,
  InitializeUploadPayload,
  ShareResourcePayload,
  UnshareResourcePayload,
} from '@limbo/files-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // =================================================================================================
  //  File Lifecycle
  // =================================================================================================

  @MessagePattern('files.init_upload')
  async initializeUpload(@Payload() payload: InitializeUploadPayload) {
    return this.filesService.file.initializeUpload(payload);
  }

  @MessagePattern('files.confirm_upload')
  async confirmUpload(@Payload() payload: ConfirmUploadPayload) {
    return this.filesService.file.confirmUpload(payload);
  }

  @MessagePattern('files.delete_file')
  async deleteFile(@Payload() payload: DeleteResourcePayload) {
    return this.filesService.file.delete(payload);
  }

  @MessagePattern('files.get_download_url')
  async getDownloadUrl(@Payload() payload: { resourceId: string; userId: string }) {
    return this.filesService.file.getDownloadUrl(payload.resourceId, payload.userId);
  }

  // =================================================================================================
  //  Folder Management
  // =================================================================================================

  @MessagePattern('files.create_folder')
  async createFolder(@Payload() payload: CreateFolderPayload) {
    return this.filesService.folder.create(payload);
  }

  @MessagePattern('files.list_content')
  async listContent(@Payload() payload: GetContentPayload) {
    return this.filesService.folder.listContent(payload);
  }

  @MessagePattern('files.delete_folder')
  async deleteFolder(@Payload() payload: DeleteResourcePayload) {
    return this.filesService.folder.delete(payload);
  }

  // =================================================================================================
  //  Access Control & Sharing
  // =================================================================================================

  @MessagePattern('files.share_file')
  async shareFile(@Payload() payload: ShareResourcePayload) {
    return this.filesService.shareFile(payload);
  }

  @MessagePattern('files.unshare_file')
  async unshareFile(@Payload() payload: UnshareResourcePayload) {
    return this.filesService.unshareFile(payload);
  }

  @MessagePattern('files.share_folder')
  async shareFolder(@Payload() payload: ShareResourcePayload) {
    return this.filesService.shareFolder(payload);
  }

  @MessagePattern('files.unshare_folder')
  async unshareFolder(@Payload() payload: UnshareResourcePayload) {
    return this.filesService.unshareFolder(payload);
  }
}

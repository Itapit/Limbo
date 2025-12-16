import {
  ConfirmUploadPayload,
  CreateFolderPayload,
  DeleteResourcePayload,
  FILES_PATTERNS,
  GetContentPayload,
  GetDownloadUrlPayload,
  InitializeUploadPayload,
  ShareResourcePayload,
  UnshareResourcePayload,
} from '@LucidRF/files-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // --- File Lifecycle ---
  @MessagePattern(FILES_PATTERNS.INIT_UPLOAD)
  async initializeUpload(@Payload() payload: InitializeUploadPayload) {
    return this.filesService.file.initializeUpload(payload);
  }

  @MessagePattern(FILES_PATTERNS.CONFIRM_UPLOAD)
  async confirmUpload(@Payload() payload: ConfirmUploadPayload) {
    return this.filesService.file.confirmUpload(payload);
  }

  @MessagePattern(FILES_PATTERNS.DELETE_FILE)
  async deleteFile(@Payload() payload: DeleteResourcePayload) {
    return this.filesService.file.delete(payload);
  }

  @MessagePattern(FILES_PATTERNS.GET_DOWNLOAD_URL)
  async getDownloadUrl(@Payload() payload: GetDownloadUrlPayload) {
    return this.filesService.file.getDownloadUrl(payload);
  }

  // --- Folder Management ---
  @MessagePattern(FILES_PATTERNS.CREATE_FOLDER)
  async createFolder(@Payload() payload: CreateFolderPayload) {
    return this.filesService.folder.create(payload);
  }

  @MessagePattern(FILES_PATTERNS.LIST_CONTENT)
  async listContent(@Payload() payload: GetContentPayload) {
    return this.filesService.folder.listContent(payload);
  }

  @MessagePattern(FILES_PATTERNS.DELETE_FOLDER)
  async deleteFolder(@Payload() payload: DeleteResourcePayload) {
    return this.filesService.folder.delete(payload);
  }

  // --- Access Control ---
  @MessagePattern(FILES_PATTERNS.SHARE_FILE)
  async shareFile(@Payload() payload: ShareResourcePayload) {
    return this.filesService.shareFile(payload);
  }

  @MessagePattern(FILES_PATTERNS.UNSHARE_FILE)
  async unshareFile(@Payload() payload: UnshareResourcePayload) {
    return this.filesService.unshareFile(payload);
  }

  @MessagePattern(FILES_PATTERNS.SHARE_FOLDER)
  async shareFolder(@Payload() payload: ShareResourcePayload) {
    return this.filesService.shareFolder(payload);
  }

  @MessagePattern(FILES_PATTERNS.UNSHARE_FOLDER)
  async unshareFolder(@Payload() payload: UnshareResourcePayload) {
    return this.filesService.unshareFolder(payload);
  }
}

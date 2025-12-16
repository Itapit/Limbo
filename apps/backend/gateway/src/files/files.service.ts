import { FILES_SERVICE } from '@LucidRF/files-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class FilesService {
  constructor(@Inject(FILES_SERVICE) private readonly filesClient: ClientProxy) {}
}

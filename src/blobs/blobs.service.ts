import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { readFile, writeFile } from 'node:fs/promises';
import { BlobValueDto } from './BlobValueDto.dto.js';

@Injectable()
export class BlobsService {
  private readonly logger = new Logger(BlobsService.name);

  async upload(file: Express.Multer.File): Promise<BlobValueDto> {
    const id = uuidv4();
    await writeFile(`blobs/${id}`, file.buffer);
    return new BlobValueDto(id);
  }

  async read(id: string): Promise<Uint8Array | undefined> {
    try {
      return await readFile(`blobs/${id}`);
    } catch (e: unknown) {
      this.logger.warn(e);
      return undefined;
    }
  }
}

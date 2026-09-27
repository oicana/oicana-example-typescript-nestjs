import { Module } from '@nestjs/common';
import { BlobsController } from './blobs.controller.js';
import { BlobsService } from './blobs.service.js';

@Module({
  imports: [],
  controllers: [BlobsController],
  providers: [BlobsService],
  exports: [BlobsService],
})
export class BlobsModule {}

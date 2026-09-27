import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller.js';
import { TemplatesService } from './templates.service.js';
import { BlobsModule } from '../blobs/blobs.module.js';

@Module({
  imports: [BlobsModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}

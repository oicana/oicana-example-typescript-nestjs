import { Module } from '@nestjs/common';
import { TemplatesModule } from './templates/templates.module.js';
import { BlobsModule } from './blobs/blobs.module.js';
import { CertificatesModule } from './certificates/certificates.module.js';

@Module({
  imports: [TemplatesModule, BlobsModule, CertificatesModule],
})
export class AppModule {}

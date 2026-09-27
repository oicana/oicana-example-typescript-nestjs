import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller.js';
import { CertificatesService } from './certificates.service.js';
import { TemplatesModule } from '../templates/templates.module.js';

@Module({
  imports: [TemplatesModule],
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}

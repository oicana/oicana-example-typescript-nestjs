import { Injectable } from '@nestjs/common';
import { Result } from 'neverthrow';
import { ServiceError } from '../serviceError.js';
import { TemplatesService } from '../templates/templates.service.js';
import { CreateCertificateDto } from './CreateCertificateDto.dto.js';
import { CompilationDto } from '../templates/CompilationDto.dto.js';

@Injectable()
export class CertificatesService {
  constructor(private templatesService: TemplatesService) {}

  /**
   * Creates a certificate PDF from typed input
   * @param request - The certificate data with a name field
   * @returns Result containing the PDF bytes or an error
   */
  public async createCertificate(
    request: CreateCertificateDto,
  ): Promise<Result<Uint8Array, ServiceError>> {
    // The "certificate" key matches the template's expected input name
    // See: https://github.com/oicana/oicana-example-templates/blob/672967c5b667dfa845228cac443d32b8b3c7ae0a/templates/certificate/typst.toml#L12
    const compilationDto: CompilationDto = {
      jsonInputs: [
        {
          key: 'certificate',
          value: request,
        },
      ],
      blobInputs: [],
    };

    return await this.templatesService.render('certificate', compilationDto);
  }
}

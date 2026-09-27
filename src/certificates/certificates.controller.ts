import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service.js';
import { CreateCertificateDto } from './CreateCertificateDto.dto.js';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a Certificate',
    description:
      'Generates a PDF certificate with the provided name using a strongly-typed input model.',
  })
  @ApiBody({
    description: 'Certificate creation data',
    type: CreateCertificateDto,
  })
  @ApiResponse({
    status: 200,
    description: 'The compiled PDF certificate',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found or compilation failed',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async createCertificate(
    @Res() res: Response,
    @Body() request: CreateCertificateDto,
  ) {
    const result = await this.certificatesService.createCertificate(request);

    result.match(
      (buffer) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="certificate_${timestamp}.pdf"`,
          'Content-Length': buffer.length,
        });
        res.status(200).end(buffer);
      },
      (error) => res.status(error.statusCode).end(error.errorMessage),
    );
  }
}

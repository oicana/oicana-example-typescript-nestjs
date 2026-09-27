import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { TemplatesService } from './templates.service.js';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CompilationDto } from './CompilationDto.dto.js';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post(':templateId/compile')
  @ApiOperation({
    summary: 'Compile a template to PDF',
    description:
      'Compiles the specified template with the provided JSON and blob inputs, returning a full-resolution PDF document. Use this endpoint for production-quality output.',
  })
  @ApiBody({
    description:
      'Compilation options including JSON inputs and blob references.',
    type: CompilationDto,
  })
  @ApiParam({
    name: 'templateId',
    required: true,
    description:
      'Identifier for the template. Get a list of available templates with `GET /templates`.',
    example: 'table',
  })
  @ApiResponse({
    status: 200,
    description: 'The compiled PDF document',
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
    status: 400,
    description: 'Compilation failed for the given inputs',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  async renderTemplate(
    @Res() res: Response,
    @Param('templateId') templateId: string,
    @Body() options: CompilationDto,
  ) {
    const result = await this.templatesService.render(templateId, options);

    result.match(
      (buffer) => {
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="document.pdf"',
          'Content-Length': buffer.length,
        });
        res.status(200).end(buffer);
      },
      (error) => res.status(error.statusCode).end(error.errorMessage),
    );
  }

  @Post(':templateId/preview')
  @ApiOperation({
    summary: 'Generate a PNG preview of a template',
    description:
      'Compiles the specified template with the provided inputs and returns a PNG preview image of the first page. Use this for quick previews before generating the full PDF.',
  })
  @ApiBody({
    description:
      'Compilation options including JSON inputs and blob references.',
    type: CompilationDto,
  })
  @ApiParam({
    name: 'templateId',
    required: true,
    description:
      'Identifier for the template. Get a list of available templates with `GET /templates`.',
    example: 'table',
  })
  @ApiResponse({
    status: 200,
    description: 'The preview PNG image',
    content: {
      'image/png': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Compilation failed for the given inputs',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  async previewTemplate(
    @Res() res: Response,
    @Param('templateId') templateId: string,
    @Body() options: CompilationDto,
  ) {
    const result = await this.templatesService.preview(templateId, options);

    result.match(
      (buffer) => {
        res.set({
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="document.png"',
          'Content-Length': buffer.length,
        });
        res.status(200).end(buffer);
      },
      (error) => res.status(error.statusCode).end(error.errorMessage),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'List all available templates',
    description:
      'Returns an array of template IDs that are available for compilation. These IDs can be used in the compile and preview endpoints.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available template IDs',
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
      example: ['certificate', 'invoice', 'table', 'minimal'],
    },
  })
  getTemplates(@Res() res: Response) {
    const templates = this.templatesService.templateList();
    res.send(templates);
  }

  @Post(':templateId/reset')
  @ApiOperation({
    summary: 'Reset the cache for a template',
    description:
      'Removes the specified template from the cache. The service will need to be restarted to reload the template.',
  })
  @ApiParam({
    name: 'templateId',
    required: true,
    description: 'Identifier for the template to reset.',
    example: 'table',
  })
  @ApiResponse({
    status: 204,
    description: 'Template successfully removed from cache',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found in cache',
  })
  resetTemplate(@Res() res: Response, @Param('templateId') templateId: string) {
    const success = this.templatesService.resetTemplate(templateId);
    res.status(success ? 204 : 404).end();
  }

  @Get(':templateId')
  @ApiOperation({
    summary: 'Download a packed template file',
    description:
      'Downloads the packed template as a .zip file. This can be useful for inspecting the template structure or using it with other Oicana tools.',
  })
  @ApiParam({
    name: 'templateId',
    required: true,
    description: 'Identifier for the template to download.',
    example: 'table',
  })
  @ApiResponse({
    status: 200,
    description: 'The packed template as a .zip file',
    content: {
      'application/zip': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  downloadTemplate(
    @Res() res: Response,
    @Param('templateId') templateId: string,
  ) {
    const filePath = this.templatesService.getTemplateFilePath(templateId);

    if (!filePath) {
      res.status(404).send(`Template '${templateId}' not found`);
      return;
    }

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${templateId}.zip"`,
    });
    res.sendFile(filePath);
  }
}

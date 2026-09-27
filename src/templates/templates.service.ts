import { Injectable, Logger } from '@nestjs/common';
import { type BlobInput, CompilationMode, Template } from '@oicana/node';
import { promises as fs } from 'fs';
import { join } from 'path';
import { BlobsService } from '../blobs/blobs.service.js';
import { CompilationDto } from './CompilationDto.dto.js';
import { err, ok, Result } from 'neverthrow';
import { ServiceError } from '../serviceError.js';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(private blobsService: BlobsService) {}

  private templates: Map<string, Template> = new Map();

  async onModuleInit() {
    await this.registerAllTemplates([
      ['accessibility', '0.1.0'],
      ['certificate', '0.1.0'],
      ['dependency', '0.1.0'],
      ['fonts', '0.1.0'],
      ['invoice', '0.1.0'],
      ['invoice_zugferd', '0.1.0'],
      ['minimal', '0.1.0'],
      ['multi_input', '0.1.0'],
      ['table', '0.1.0'],
    ]);
  }

  async registerAllTemplates(templates: string[][]) {
    for (const [templateId, version] of templates) {
      const fullPath = join(
        import.meta.dirname,
        `${templateId}-${version}.zip`,
      );
      const buffer = await fs.readFile(fullPath);
      const template = new Template(buffer);

      this.templates.set(templateId, template);
    }
  }

  // In production environments it might make sense to move compilation
  // to a worker thread using e.g. like https://github.com/piscinajs/piscina
  public async render(
    templateId: string,
    options: CompilationDto,
  ): Promise<Result<Uint8Array, ServiceError>> {
    const template = this.templates.get(templateId);

    if (template === undefined) {
      return err({
        errorMessage: 'Template not found',
        statusCode: 404,
      });
    }

    const [jsonInputs, blobInputs] = await this.prepareInputs(options);
    try {
      const result = await template.exportPdfAsync(
        jsonInputs,
        blobInputs,
        CompilationMode.Production,
      );
      return ok(result);
    } catch (compilationException: unknown) {
      this.logger.error(compilationException);
      const errorMessage =
        compilationException instanceof Error
          ? compilationException.message
          : String(compilationException);
      return err({
        errorMessage: `Failed to compile template with given inputs:\n${errorMessage}`,
        statusCode: 400,
      });
    }
  }

  public async preview(
    templateId: string,
    options: CompilationDto,
  ): Promise<Result<Uint8Array, ServiceError>> {
    const template = this.templates.get(templateId);

    if (template === undefined) {
      return err({
        errorMessage: 'Template not found',
        statusCode: 404,
      });
    }

    const [jsonInputs, blobInputs] = await this.prepareInputs(options);
    try {
      const result = await template.exportPngAsync(
        jsonInputs,
        blobInputs,
        CompilationMode.Development,
        1.0,
      );
      return ok(result);
    } catch (compilationException: unknown) {
      this.logger.error(compilationException);
      const errorMessage =
        compilationException instanceof Error
          ? compilationException.message
          : String(compilationException);
      return err({
        errorMessage: `Failed to compile template with given inputs:\n${errorMessage}`,
        statusCode: 400,
      });
    }
  }

  public templateList(): string[] {
    return [...this.templates.keys()];
  }

  public resetTemplate(templateId: string): boolean {
    const existed = this.templates.delete(templateId);
    if (existed) {
      this.logger.log(`Template '${templateId}' removed from cache`);
    } else {
      this.logger.error(`Template '${templateId}' not found in cache`);
    }
    return existed;
  }

  public getTemplateFilePath(templateId: string): string | null {
    const templateIds = this.templateList();
    if (!templateIds.includes(templateId)) {
      return null;
    }
    return join(import.meta.dirname, `${templateId}-0.1.0.zip`);
  }

  private async prepareInputs(
    options: CompilationDto,
  ): Promise<[Map<string, string>, Map<string, BlobInput>]> {
    const jsonInputs = new Map<string, string>();
    const blobInputs = new Map<string, BlobInput>();

    for (const jsonInputValue of options.jsonInputs) {
      jsonInputs.set(jsonInputValue.key, JSON.stringify(jsonInputValue.value));
    }

    for (const blobInputValue of options.blobInputs) {
      const file = await this.blobsService.read(blobInputValue.blobId);
      if (file === undefined) continue;
      blobInputs.set(blobInputValue.key, { data: file });
    }

    return [jsonInputs, blobInputs];
  }
}

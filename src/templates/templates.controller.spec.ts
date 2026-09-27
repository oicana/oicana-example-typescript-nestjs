import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller.js';
import { TemplatesService } from './templates.service.js';
import { BlobsModule } from '../blobs/blobs.module.js';
import type { Response } from 'express';

describe('TemplatesController', () => {
  let templatesController: TemplatesController;
  let templatesService: TemplatesService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [BlobsModule],
      controllers: [TemplatesController],
      providers: [TemplatesService],
    }).compile();

    templatesController = app.get<TemplatesController>(TemplatesController);
    templatesService = app.get<TemplatesService>(TemplatesService);
  });

  describe('getTemplates', () => {
    it('should return an array of template IDs', () => {
      const mockResponse = {
        send: vi.fn(),
      } as unknown as Response;

      templatesController.getTemplates(mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith(
        templatesService.templateList(),
      );
    });
  });
});

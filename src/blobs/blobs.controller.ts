import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BlobsService } from './blobs.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FileUploadDto } from './FileUploadDto.dto.js';
import { BlobValueDto } from './BlobValueDto.dto.js';

@Controller('blobs')
export class BlobsController {
  constructor(private readonly blobsService: BlobsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a file blob',
    description:
      'Uploads a binary file (e.g., image, PDF) and returns a blob ID that can be used as input when compiling templates. The uploaded file is stored locally and can be referenced by its UUID in template compilation requests.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Binary file to upload. This example does not store the MIME type of uploads.',
    type: FileUploadDto,
  })
  @ApiCreatedResponse({
    description: 'The blob has been successfully stored.',
    type: BlobValueDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - no file provided or invalid file.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - failed to store the file.',
  })
  uploadFile(@UploadedFile() file: Express.Multer.File): Promise<BlobValueDto> {
    return this.blobsService.upload(file);
  }
}

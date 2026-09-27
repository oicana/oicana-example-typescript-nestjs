import { ApiProperty } from '@nestjs/swagger';
import { JsonInputDto } from './JsonInputDto.dto.js';
import { BlobInputDto } from './BlobInputDto.dto.js';

export class CompilationDto {
  @ApiProperty({
    description: 'Array of JSON inputs to pass to the template',
    type: [JsonInputDto],
  })
  jsonInputs: JsonInputDto[];

  @ApiProperty({
    description:
      'Array of blob inputs (uploaded files) to pass to the template',
    type: [BlobInputDto],
  })
  blobInputs: BlobInputDto[];
}

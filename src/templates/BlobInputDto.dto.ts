import { ApiProperty } from '@nestjs/swagger';

export class BlobInputDto {
  @ApiProperty({
    description: 'The input key name as defined in the template',
    example: 'banner',
  })
  key: string;

  @ApiProperty({
    description:
      'UUID of a previously uploaded blob (obtained from POST /blobs/upload)',
    example: '00000000-0000-0000-0000-000000000000',
  })
  blobId: string;
}

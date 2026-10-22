import { ApiProperty } from '@nestjs/swagger';

export class JsonInputDto {
  @ApiProperty({
    description: 'The input key name as defined in the template',
    example: 'invoice',
    type: 'string',
  })
  key: string;

  @ApiProperty({
    description: 'The JSON value to pass to the template for this input key',
    example: {
      id: '2025-03-10t172205',
      issuingDate: '2025-04-27',
      deliveryDate: '2025-04-19',
      dueDate: '2025-05-06',
      biller: {
        name: 'Alex Johnson',
        title: 'Senior Consultant',
        company: 'Example Solutions GmbH',
        'vat-id': 'DE1234567',
        iban: 'DE89370400440532013000',
        address: {
          country: 'Germany',
          city: 'Berlin',
          'postal-code': '10115',
          street: 'Sample Street 23',
        },
      },
      recipient: {
        name: 'Maria Schmidt',
        title: 'IT Manager',
        'vat-id': 'DE7654321',
        address: {
          country: 'Germany',
          city: 'Munich',
          'postal-code': '80331',
          street: 'Business Avenue 1',
        },
      },
      items: [
        {
          date: '2025-04-03',
          description: 'Wireless keyboard',
          quantity: 4,
          price: 25,
        },
        {
          date: '2025-04-03',
          description: 'USB-C cable',
          quantity: 2,
          price: 45,
        },
        {
          date: '2025-04-03',
          description: 'Network infrastructure consultation',
          'dur-min': 120,
          price: 200,
        },
      ],
    },
  })
  value: any;
}

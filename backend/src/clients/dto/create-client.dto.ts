import { IsString, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  name: string;
}

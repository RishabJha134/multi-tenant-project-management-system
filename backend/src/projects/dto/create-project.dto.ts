import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2, { message: 'Project name must be at least 2 characters long' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

import { IsEmail, IsString, MinLength, IsOptional, IsUUID } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsUUID()
  clientId: string;

  @IsOptional()
  @IsString()
  role?: string; // 'admin' or 'member'
}

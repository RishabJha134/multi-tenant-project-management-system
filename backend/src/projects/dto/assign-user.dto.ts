import { IsUUID, IsString, IsIn } from 'class-validator';

export class AssignUserDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsIn(['owner', 'developer', 'viewer'], {
    message: 'Role must be owner, developer, or viewer',
  })
  role: string;
}

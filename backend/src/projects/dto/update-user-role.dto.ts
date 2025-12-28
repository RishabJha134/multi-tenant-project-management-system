import { IsString, IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  @IsIn(['owner', 'developer', 'viewer'])
  role: string;
}

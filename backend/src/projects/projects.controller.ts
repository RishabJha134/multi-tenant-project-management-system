import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(
      createProjectDto,
      req.user.id,
      req.user.clientId,
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.projectsService.findAll(req.user.clientId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(
      id,
      req.user.id,
      req.user.clientId,
      req.user.role,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(
      id,
      updateProjectDto,
      req.user.id,
      req.user.clientId,
      req.user.role,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(
      id,
      req.user.id,
      req.user.clientId,
      req.user.role,
    );
  }

  @Post(':id/users')
  assignUser(
    @Param('id') id: string,
    @Body() assignUserDto: AssignUserDto,
    @Request() req,
  ) {
    return this.projectsService.assignUser(
      id,
      assignUserDto,
      req.user.id,
      req.user.clientId,
      req.user.role,
    );
  }

  @Put(':id/users/:userId')
  updateUserRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req,
  ) {
    return this.projectsService.updateUserRole(
      id,
      userId,
      updateUserRoleDto,
      req.user.id,
      req.user.clientId,
      req.user.role,
    );
  }

  @Delete(':id/users/:userId')
  removeUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.projectsService.removeUser(
      id,
      userId,
      req.user.id,
      req.user.clientId,
      req.user.role,
    );
  }

  @Get(':id/users')
  getProjectUsers(@Param('id') id: string, @Request() req) {
    return this.projectsService.getProjectUsers(
      id,
      req.user.id,
      req.user.clientId,
      req.user.role,
    );
  }
}

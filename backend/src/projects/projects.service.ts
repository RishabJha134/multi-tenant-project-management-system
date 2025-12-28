import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectUser, User } from '../entities';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectUser)
    private projectUserRepository: Repository<ProjectUser>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Create a new project
  async create(createProjectDto: CreateProjectDto, userId: string, clientId: string) {
    const { name, description } = createProjectDto;

    const project = this.projectRepository.create({
      name,
      description,
      clientId,
    });

    await this.projectRepository.save(project);

    // Automatically assign the creator as project owner
    const projectUser = this.projectUserRepository.create({
      projectId: project.id,
      userId: userId,
      role: 'owner',
    });

    await this.projectUserRepository.save(projectUser);

    return {
      message: 'Project created successfully',
      project,
    };
  }

  // Get all projects for user's client
  async findAll(clientId: string, userId: string) {
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.projectUsers', 'projectUser')
      .leftJoinAndSelect('projectUser.user', 'user')
      .where('project.clientId = :clientId', { clientId })
      .orderBy('project.createdAt', 'DESC')
      .getMany();

    // Filter to include only projects where the user is assigned
    const userProjects = projects.filter((project) =>
      project.projectUsers.some((pu) => pu.userId === userId),
    );

    return userProjects;
  }

  // Get a single project by ID
  async findOne(id: string, userId: string, clientId: string, role: string) {
    const project = await this.projectRepository.findOne({
      where: { id, clientId },
      relations: ['projectUsers', 'projectUsers.user'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has access to this project (is assigned or is admin)
    const isAssigned = project.projectUsers.some((pu) => pu.userId === userId);
    const isAdmin = role === 'admin';

    if (!isAssigned && !isAdmin) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  // Update a project
  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
    clientId: string,
    role: string,
  ) {
    const project = await this.findOne(id, userId, clientId, role);

    // Check if user is owner or admin
    const projectUser = project.projectUsers.find((pu) => pu.userId === userId);
    const isOwner = projectUser?.role === 'owner';
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only project owners or admins can update projects');
    }

    Object.assign(project, updateProjectDto);
    await this.projectRepository.save(project);

    return {
      message: 'Project updated successfully',
      project,
    };
  }

  // Delete a project
  async remove(id: string, userId: string, clientId: string, role: string) {
    const project = await this.findOne(id, userId, clientId, role);

    // Check if user is owner or admin
    const projectUser = project.projectUsers.find((pu) => pu.userId === userId);
    const isOwner = projectUser?.role === 'owner';
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only project owners or admins can delete projects');
    }

    // IMPORTANT: Delete all project_users assignments first
    // This prevents foreign key constraint violations
    await this.projectUserRepository.delete({ projectId: id });

    // Now we can safely delete the project
    await this.projectRepository.remove(project);

    return {
      message: 'Project deleted successfully',
    };
  }

  // Assign a user to a project
  async assignUser(
    projectId: string,
    assignUserDto: AssignUserDto,
    requestUserId: string,
    clientId: string,
    role: string,
  ) {
    const { userId, role: userRole } = assignUserDto;

    // Check if project exists
    const project = await this.findOne(projectId, requestUserId, clientId, role);

    // Check if requesting user is owner or admin
    const projectUser = project.projectUsers.find((pu) => pu.userId === requestUserId);
    const isOwner = projectUser?.role === 'owner';
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only project owners or admins can assign users');
    }

    // Check if user exists and belongs to same client
    const user = await this.userRepository.findOne({
      where: { id: userId, clientId },
    });

    if (!user) {
      throw new NotFoundException('User not found or does not belong to this client');
    }

    // Check if user is already assigned
    const existingAssignment = await this.projectUserRepository.findOne({
      where: { projectId, userId },
    });

    if (existingAssignment) {
      throw new ConflictException('User is already assigned to this project');
    }

    // Assign the user
    const newProjectUser = this.projectUserRepository.create({
      projectId,
      userId,
      role: userRole,
    });

    await this.projectUserRepository.save(newProjectUser);

    return {
      message: 'User assigned to project successfully',
      projectUser: newProjectUser,
    };
  }

  // Update user role in project
  async updateUserRole(
    projectId: string,
    userId: string,
    updateUserRoleDto: UpdateUserRoleDto,
    requestUserId: string,
    clientId: string,
    role: string,
  ) {
    const project = await this.findOne(projectId, requestUserId, clientId, role);

    // Check if requesting user is owner or admin
    const requestUserProjectUser = project.projectUsers.find(
      (pu) => pu.userId === requestUserId,
    );
    const isOwner = requestUserProjectUser?.role === 'owner';
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only project owners or admins can update user roles');
    }

    // Find the project user assignment
    const projectUser = await this.projectUserRepository.findOne({
      where: { projectId, userId },
    });

    if (!projectUser) {
      throw new NotFoundException('User is not assigned to this project');
    }

    projectUser.role = updateUserRoleDto.role;
    await this.projectUserRepository.save(projectUser);

    return {
      message: 'User role updated successfully',
      projectUser,
    };
  }

  // Remove user from project
  async removeUser(
    projectId: string,
    userId: string,
    requestUserId: string,
    clientId: string,
    role: string,
  ) {
    const project = await this.findOne(projectId, requestUserId, clientId, role);

    // Check if requesting user is owner or admin
    const requestUserProjectUser = project.projectUsers.find(
      (pu) => pu.userId === requestUserId,
    );
    const isOwner = requestUserProjectUser?.role === 'owner';
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only project owners or admins can remove users');
    }

    // Find the project user assignment
    const projectUser = await this.projectUserRepository.findOne({
      where: { projectId, userId },
    });

    if (!projectUser) {
      throw new NotFoundException('User is not assigned to this project');
    }

    await this.projectUserRepository.remove(projectUser);

    return {
      message: 'User removed from project successfully',
    };
  }

  // Get all users assigned to a project
  async getProjectUsers(
    projectId: string,
    requestUserId: string,
    clientId: string,
    role: string,
  ) {
    const project = await this.findOne(projectId, requestUserId, clientId, role);

    return project.projectUsers.map((pu) => ({
      id: pu.id,
      userId: pu.userId,
      role: pu.role,
      createdAt: pu.createdAt,
      user: {
        id: pu.user.id,
        email: pu.user.email,
        role: pu.user.role,
      },
    }));
  }
}

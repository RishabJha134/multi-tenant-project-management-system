import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const { name } = createClientDto;

    // Check if client already exists
    const existingClient = await this.clientRepository.findOne({
      where: { name },
    });

    if (existingClient) {
      throw new ConflictException('Client with this name already exists');
    }

    const client = this.clientRepository.create({ name });
    await this.clientRepository.save(client);

    return {
      message: 'Client created successfully',
      client,
    };
  }

  async findAll() {
    return this.clientRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return this.clientRepository.findOne({
      where: { id },
      relations: ['users', 'projects'],
    });
  }
}

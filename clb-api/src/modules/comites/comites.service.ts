import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comite } from '../../database/entities/comite.entity';

@Injectable()
export class ComitesService {
  constructor(@InjectRepository(Comite) private repository: Repository<Comite>) {}

  async findAll(filters?: any) {
    const query = this.repository.createQueryBuilder('c');
    if (filters.tipo) query.andWhere('c.tipo = :tipo', { tipo: filters.tipo });
    if (filters.estado) query.andWhere('c.estado = :estado', { estado: filters.estado });
    return query.getMany();
  }

  async findOne(id: number) {
    const comite = await this.repository.findOne({ where: { id } });
    if (!comite) throw new NotFoundException('Comité no encontrado');
    return comite;
  }

  async create(data: any) {
    const comite = this.repository.create(data);
    return this.repository.save(comite);
  }

  async update(id: number, data: any) {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: number) {
    const result = await this.repository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Comité no encontrado');
    return { message: 'Comité eliminado' };
  }
}
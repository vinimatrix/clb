import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Elector } from '../../database/entities/elector.entity';

@Injectable()
export class ElectoresService {
  constructor(@InjectRepository(Elector) private repository: Repository<Elector>) {}

  async findAll(filters?: any) {
    const query = this.repository.createQueryBuilder('e');
    if (filters.estado) query.andWhere('e.estado = :estado', { estado: filters.estado });
    if (filters.recinto) query.andWhere('e.recinto = :recinto', { recinto: filters.recinto });
    if (filters.mesa) query.addOrderBy('e.mesa', 'ASC');
    if (filters.search) {
      query.andWhere('(e.nombres LIKE :search OR e.apellidos LIKE :search OR e.cedula LIKE :search)', { search: `%${filters.search}%` });
    }
    return query.getMany();
  }

  async findOne(id: number) {
    const elector = await this.repository.findOne({ where: { id } });
    if (!elector) throw new NotFoundException('Elector no encontrado');
    return elector;
  }

  async create(data: any) {
    const elector = this.repository.create(data);
    return this.repository.save(elector);
  }

  async update(id: number, data: any) {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: number) {
    const result = await this.repository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Elector no encontrado');
    return { message: 'Elector eliminado' };
  }
}
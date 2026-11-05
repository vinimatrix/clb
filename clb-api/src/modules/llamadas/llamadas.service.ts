import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Llamada } from '../../database/entities/llamada.entity';

@Injectable()
export class LlamadasService {
  constructor(@InjectRepository(Llamada) private repository: Repository<Llamada>) {}

  async findAll(filters?: any) {
    const query = this.repository.createQueryBuilder('l');
    if (filters.estado) query.andWhere('l.estado = :estado', { estado: filters.estado });
    return query.getMany();
  }

  async findOne(id: number) {
    const llamada = await this.repository.findOne({ where: { id } });
    if (!llamada) throw new NotFoundException('Llamada no encontrada');
    return llamada;
  }

  async create(data: any) {
    const llamada = this.repository.create(data);
    return this.repository.save(llamada);
  }

  async update(id: number, data: any) {
    await this.repository.update(id, data);
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: number) {
    const result = await this.repository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Llamada no encontrada');
    return { message: 'Llamada eliminada' };
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class UsuariosService {
  constructor(@InjectRepository(User) private usuariosRepository: Repository<User>) {}

  async findAll() {
    return this.usuariosRepository.find({
      select: ['id', 'cedula', 'username', 'nombres', 'apellidos', 'telefono', 'role', 'createdAt'],
    });
  }

  async findOne(id: number) {
    const user = await this.usuariosRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return {
      id: user.id,
      cedula: user.cedula,
      username: user.username,
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async update(id: number, data: any) {
    const user = await this.usuariosRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.usuariosRepository.update(id, {
      nombres: data.nombres,
      apellidos: data.apellidos,
      telefono: data.telefono,
      role: data.role,
    });
    return this.usuariosRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    const result = await this.usuariosRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return { message: 'Usuario eliminado' };
  }

  async getPermissions(rol: string) {
    // Los permisos están definidos en seed.js, devolver configuración por defecto
    const permisosPorRol: any = {
      coordinador: {
        inscripcion: true,
        miRecinto: false,
        miCarpeta: false,
        fidelizados: false,
        cba: false,
        cbe: false,
        callcenter: false,
        admin: false,
      },
      dirigente: {
        inscripcion: true,
        miRecinto: true,
        miCarpeta: true,
        fidelizados: false,
        cba: false,
        cbe: false,
        callcenter: false,
        admin: false,
      },
      admin: {
        inscripcion: true,
        miRecinto: true,
        miCarpeta: true,
        fidelizados: true,
        cba: true,
        cbe: true,
        callcenter: true,
        admin: true,
      },
    };
    return permisosPorRol[rol] || {};
  }

  async updatePermission(rol: string, modulo: string, habilitado: boolean) {
    // En una implementación completa, esto se guardaría en base de datos
    return { rol, modulo, habilitado: habilitado ? 1 : 0 };
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usuariosRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(cedula: string, password: string): Promise<any> {
    const user = await this.usuariosRepository.findOne({ where: { cedula } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        cedula: user.cedula,
        username: user.username,
        nombres: user.nombres,
        apellidos: user.apellidos,
        role: user.role,
        telefono: user.telefono,
      },
    };
  }

  async register(userData: any) {
    const { cedula, username, password, nombres, apellidos, telefono, role } = userData;

    const existing = await this.usuariosRepository.findOne({
      where: [{ cedula }, { username }],
    });
    if (existing) {
      throw new Error('Usuario ya existe');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usuariosRepository.create({
      cedula,
      username,
      passwordHash,
      nombres,
      apellidos,
      telefono,
      role: role || 'coordinador',
    });
    const saved = await this.usuariosRepository.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async findAll() {
    return this.usuariosRepository.find({
      select: ['id', 'cedula', 'username', 'nombres', 'apellidos', 'telefono', 'role', 'createdAt'],
    });
  }

  async updateRole(id: number, role: string) {
    await this.usuariosRepository.update(id, { role });
    return this.usuariosRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    await this.usuariosRepository.delete(id);
    return { message: 'Usuario eliminado' };
  }
}
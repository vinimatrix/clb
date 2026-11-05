import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  async findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.usuariosService.update(0, body);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: any) {
    return this.usuariosService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.usuariosService.delete(id);
  }

  @Get('permisos/:rol')
  async getPermissions(@Param('rol') rol: string) {
    return this.usuariosService.getPermissions(rol);
  }

  @Put('permisos/:rol/:modulo')
  async updatePermission(@Param('rol') rol: string, @Param('modulo') modulo: string, @Body() body: { habilitado: boolean }) {
    return this.usuariosService.updatePermission(rol, modulo, body.habilitado);
  }
}
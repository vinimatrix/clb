import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { Throttle } from '@nestjs/throttler';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { User } from '../../database/entities/user.entity';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  @Throttle({ default: { limit: 100, ttl: 60 } })
  async findAll(@Query() pagination: PaginationQueryDto): Promise<PaginatedResponse<User>> {
    return this.usuariosService.findAll(pagination);
  }

  @Get(':id')
  @Throttle({ default: { limit: 100, ttl: 60 } })
  async findOne(@Param('id') id: number) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60 } })
  @HttpCode(201)
  async create(@Body() body: any) {
    return this.usuariosService.create(body);
  }

  @Put(':id')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  async update(@Param('id') id: number, @Body() body: any) {
    return this.usuariosService.update(id, body);
  }

  @Delete(':id')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  async delete(@Param('id') id: number) {
    return this.usuariosService.delete(id);
  }

  @Get('permisos/:rol')
  @Throttle({ default: { limit: 100, ttl: 60 } })
  async getPermissions(@Param('rol') rol: string) {
    return this.usuariosService.getPermissions(rol);
  }

  @Put('permisos/:rol/:modulo')
  @Throttle({ default: { limit: 500, ttl: 60 } })
  async updatePermission(
    @Param('rol') rol: string,
    @Param('modulo') modulo: string,
    @Body() body: { habilitado: boolean }
  ) {
    return this.usuariosService.updatePermission(rol, modulo, body.habilitado);
  }
}

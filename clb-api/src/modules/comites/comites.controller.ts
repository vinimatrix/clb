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
import { ComitesService } from './comites.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { Throttle } from '@nestjs/throttler';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { Comite } from '../../database/entities/comite.entity';

@Controller('comites')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ComitesController {
  constructor(private service: ComitesService) {}

  @Get()
  @Throttle({ default: { limit: 100, ttl: 60 } })
  async findAll(
    @Query() query: any,
    @Query() pagination: PaginationQueryDto
  ): Promise<PaginatedResponse<Comite>> {
    const filters = { tipo: query.tipo, estado: query.estado, recinto: query.recinto };
    return this.service.findAll(filters, pagination);
  }

  @Get(':id')
  @Throttle({ default: { limit: 100, ttl: 60 } })
  async findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60 } })
  @HttpCode(201)
  async create(@Body() body: any) {
    return this.service.create(body);
  }

  @Put(':id')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  async update(@Param('id') id: number, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  async delete(@Param('id') id: number) {
    return this.service.delete(id);
  }

  @Put(':id/asignar-suplente')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  async asignarSuplente(
    @Param('id') id: number,
    @Body() body: { nombre: string }
  ) {
    return this.service.asignarSuplente(id, body.nombre);
  }
}

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
import { ElectoresService } from './electores.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { Throttle } from '@nestjs/throttler';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { Elector } from '../../database/entities/elector.entity';

@Controller('electores')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ElectoresController {
  constructor(private service: ElectoresService) {}

  @Get()
  @Throttle({ default: { limit: 100, ttl: 60 } })
  async findAll(
    @Query() query: any,
    @Query() pagination: PaginationQueryDto
  ): Promise<PaginatedResponse<Elector>> {
    const filters = {
      estado: query.estado,
      recinto: query.recinto,
      mesa: query.mesa,
      search: query.search,
      asignadoA: query.asignadoA,
    };
    return this.service.findAll(filters, pagination);
  }

  @Get('stats')
  @Throttle({ default: { limit: 100, ttl: 60 } })
  async getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  @Throttle({ default: { limit: 100, ttl: 60 } })
  async findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Get('cedula/:cedula')
  @Throttle({ default: { limit: 100, ttl: 60 } })
  async findByCedula(@Param('cedula') cedula: string) {
    return this.service.findByCedula(cedula);
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

  @Put(':id/fidelizar')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  async fidelizar(@Param('id') id: number) {
    return this.service.fidelizar(id);
  }

  @Put(':id/reconfirmar')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  async reconfirmar(@Param('id') id: number) {
    return this.service.reconfirmar(id);
  }
}

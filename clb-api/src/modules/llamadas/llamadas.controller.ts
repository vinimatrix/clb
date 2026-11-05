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
} from '@nestjs/common';
import { LlamadasService } from './llamadas.service';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { Throttle } from '@nestjs/throttler';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { Llamada } from '../../database/entities/llamada.entity';

@Controller('llamadas')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class LlamadasController {
  constructor(private service: LlamadasService) {}

  @Get()
  @Throttle({ default: { limit: 100, ttl: 60 } })
  async findAll(
    @Query() query: any,
    @Query() pagination: PaginationQueryDto
  ): Promise<PaginatedResponse<Llamada>> {
    const filters = { estado: query.estado, recinto: query.recinto };
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

  @Post()
  @Throttle({ default: { limit: 30, ttl: 60 } })
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

  @Put(':id/completar')
  @Throttle({ default: { limit: 30, ttl: 60 } })
  async completar(@Param('id') id: number) {
    return this.service.completar(id);
  }
}

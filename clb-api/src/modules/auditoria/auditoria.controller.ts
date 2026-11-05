import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategies/jwt.guard';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
@UseGuards(JwtAuthGuard)
export class AuditoriaController {
  constructor(private auditoriaService: AuditoriaService) {}

  @Get('historial')
  async obtenerHistorial(
    @Query('usuarioId') usuarioId: number,
    @Query('limite') limite?: number,
  ) {
    return this.auditoriaService.obtenerHistorial(usuarioId, limite ?? 50);
  }
}

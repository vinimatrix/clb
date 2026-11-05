import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LlamadasController } from './llamadas.controller';
import { LlamadasService } from './llamadas.service';
import { Llamada } from '../../database/entities/llamada.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Llamada])],
  providers: [LlamadasService],
  controllers: [LlamadasController],
  exports: [LlamadasService],
})
export class LlamadasModule {}
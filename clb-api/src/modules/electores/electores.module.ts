import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectoresController } from './electores.controller';
import { ElectoresService } from './electores.service';
import { Elector } from '../../database/entities/elector.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Elector]), AuditoriaModule],
  providers: [ElectoresService],
  controllers: [ElectoresController],
  exports: [ElectoresService],
})
export class ElectoresModule {}

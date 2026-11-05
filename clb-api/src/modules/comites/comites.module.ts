import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComitesController } from './comites.controller';
import { ComitesService } from './comites.service';
import { Comite } from '../../database/entities/comite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comite])],
  providers: [ComitesService],
  controllers: [ComitesController],
  exports: [ComitesService],
})
export class ComitesModule {}
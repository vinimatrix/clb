import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('llamadas')
@Index('IX_llamadas_estado', ['estado'])
@Index('IX_llamadas_recinto', ['recinto'])
@Index('IX_llamadas_creadoEn', ['creadoEn'])
export class Llamada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 200 })
  nombre: string;

  @Column('varchar', { length: 200 })
  motivo: string;

  @Column('nvarchar', { length: 'max', nullable: true })
  detalle: string | null;

  @Column('varchar', { length: 100, nullable: true })
  recinto: string | null;

  @Column('varchar', { length: 30, default: 'pendiente' })
  estado: string;

  @Column('bit', { default: 0 })
  completado: boolean;

  @Column('datetime2', { nullable: true })
  completadoAt: Date | null;

  @Column('datetime2', { default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: Date;
}

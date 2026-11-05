import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('tareas')
@Index('IX_tareas_electorId', ['electorId'])
@Index('IX_tareas_estado', ['estado'])
@Index('IX_tareas_vencimiento', ['vencimiento'])
export class Tarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 100 })
  electorId: string;

  @Column('varchar', { length: 50 })
  tipo: string;

  @Column('varchar', { length: 30, default: 'pendiente' })
  estado: string;

  @Column('varchar', { length: 50, nullable: true })
  vencimiento: string | null;

  @Column('datetime2', { default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: Date;

  @Column('datetime2', { nullable: true })
  completadoEn: Date | null;
}

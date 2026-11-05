import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tareas')
export class Tarea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  electorId: string;

  @Column()
  tipo: string;

  @Column({ default: 'pendiente' })
  estado: string;

  @Column({ nullable: true })
  vencimiento: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: string;

  @Column({ nullable: true })
  completadoEn: string;
}
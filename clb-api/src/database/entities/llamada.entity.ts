import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('llamadas')
export class Llamada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  motivo: string;

  @Column({ nullable: true })
  detalle: string;

  @Column({ nullable: true })
  recinto: string;

  @Column({ default: 'pendiente' })
  estado: string;

  @Column({ default: 0 })
  completado: number;

  @Column({ nullable: true })
  completadoAt: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: string;
}
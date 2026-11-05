import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('comites')
@Index('IX_comites_codigo', ['codigo'], { unique: true })
@Index('IX_comites_tipo', ['tipo'])
@Index('IX_comites_estado', ['estado'])
@Index('IX_comites_recinto', ['recinto'])
export class Comite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 20 })
  tipo: string;

  @Column('varchar', { length: 20, unique: true })
  codigo: string;

  @Column('varchar', { length: 200 })
  nombre: string;

  @Column('varchar', { length: 100 })
  lider: string;

  @Column('varchar', { length: 20, nullable: true })
  cedulaLider: string | null;

  @Column('varchar', { length: 100, nullable: true })
  sector: string | null;

  @Column('varchar', { length: 100, nullable: true })
  recinto: string | null;

  @Column('varchar', { length: 20, nullable: true })
  mesa: string | null;

  @Column('varchar', { length: 30, default: 'proceso' })
  estado: string;

  @Column('varchar', { length: 50, default: '0 de 0' })
  votos: string;

  @Column('int', { default: 1 })
  integrantes: number;

  @Column('varchar', { length: 20, nullable: true })
  telefono: string | null;

  @Column('nvarchar', { length: 'max', nullable: true })
  delegados: string | null;

  @Column('nvarchar', { length: 'max', nullable: true })
  votoComprometido: string | null;

  @Column('nvarchar', { length: 'max', nullable: true })
  alerta: string | null;
}

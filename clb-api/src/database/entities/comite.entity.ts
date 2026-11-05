import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('comites')
export class Comite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tipo: string;

  @Column({ unique: true })
  codigo: string;

  @Column()
  nombre: string;

  @Column()
  lider: string;

  @Column({ nullable: true })
  cedulaLider: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ nullable: true })
  recinto: string;

  @Column({ nullable: true })
  mesa: string;

  @Column({ default: 'proceso' })
  estado: string;

  @Column({ default: '0 de 0' })
  votos: string;

  @Column({ default: 1 })
  integrantes: number;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  delegados: string;

  @Column({ nullable: true })
  votoComprometido: string;

  @Column({ nullable: true })
  alerta: string;
}
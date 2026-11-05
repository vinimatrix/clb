import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('electores')
export class Elector {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cedula: string;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ nullable: true })
  edad: number;

  @Column({ nullable: true })
  telefono: string;

  @Column({ default: 1 })
  whatsapp: number;

  @Column({ nullable: true })
  telefonoAlt: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ nullable: true })
  recinto: string;

  @Column({ nullable: true })
  mesa: string;

  @Column({ nullable: true })
  orden: number;

  @Column({ default: 'indeciso' })
  estado: string;

  @Column({ nullable: true })
  cba: string;

  @Column({ nullable: true })
  celula: string;

  @Column({ default: 0 })
  movilizacionDiaD: number;

  @Column({ nullable: true })
  asignadoA: string;

  @Column({ nullable: true })
  registradoPor: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column({ nullable: true })
  intento: string;

  @Column({ nullable: true })
  reconfirmadoAt: string;
}
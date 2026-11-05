import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('electores')
@Index('IX_electores_cedula', ['cedula'], { unique: true })
@Index('IX_electores_estado', ['estado'])
@Index('IX_electores_recinto', ['recinto'])
@Index('IX_electores_mesa', ['mesa'])
@Index('IX_electores_estado_recinto', ['estado', 'recinto'])
export class Elector {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 20, unique: true })
  cedula: string;

  @Column('varchar', { length: 100 })
  nombres: string;

  @Column('varchar', { length: 100 })
  apellidos: string;

  @Column('int', { nullable: true })
  edad: number | null;

  @Column('varchar', { length: 20, nullable: true })
  telefono: string | null;

  @Column('bit', { default: 1 })
  whatsapp: boolean;

  @Column('varchar', { length: 20, nullable: true })
  telefonoAlt: string | null;

  @Column('varchar', { length: 100, nullable: true })
  sector: string | null;

  @Column('varchar', { length: 200, nullable: true })
  direccion: string | null;

  @Column('varchar', { length: 100, nullable: true })
  recinto: string | null;

  @Column('varchar', { length: 20, nullable: true })
  mesa: string | null;

  @Column('int', { nullable: true })
  orden: number | null;

  @Column('varchar', { length: 20, default: 'indeciso' })
  estado: string;

  @Column('varchar', { length: 100, nullable: true })
  cba: string | null;

  @Column('varchar', { length: 50, nullable: true })
  celula: string | null;

  @Column('bit', { default: 0 })
  movilizacionDiaD: boolean;

  @Column('varchar', { length: 100, nullable: true })
  asignadoA: string | null;

  @Column('varchar', { length: 100, nullable: true })
  registradoPor: string | null;

  @Column('datetime2', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('varchar', { length: 500, nullable: true })
  intento: string | null;

  @Column('datetime2', { nullable: true })
  reconfirmadoAt: Date | null;
}

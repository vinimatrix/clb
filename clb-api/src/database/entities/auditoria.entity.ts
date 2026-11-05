import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('auditoria')
@Index('IX_auditoria_usuario', ['usuarioId'])
@Index('IX_auditoria_accion', ['accion'])
@Index('IX_auditoria_fecha', ['fecha'])
@Index('IX_auditoria_cedula', ['cedulaConsultada'])
export class Auditoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  usuarioId: number;

  @Column('varchar', { length: 100 })
  accion: string;

  @Column('varchar', { length: 20, nullable: true })
  cedulaConsultada: string | null;

  @Column('varchar', { length: 50, nullable: true })
  resultado: string | null;

  @Column('varchar', { length: 45, nullable: true })
  ipAddress: string | null;

  @Column('datetime2', { default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;
}

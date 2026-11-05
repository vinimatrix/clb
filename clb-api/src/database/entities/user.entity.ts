import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('users')
@Index('IX_users_cedula', ['cedula'], { unique: true })
@Index('IX_users_username', ['username'], { unique: true })
@Index('IX_users_role', ['role'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 20, unique: true })
  cedula: string;

  @Column('varchar', { length: 50, unique: true })
  username: string;

  @Column('varchar', { length: 255 })
  passwordHash: string;

  @Column('varchar', { length: 100 })
  nombres: string;

  @Column('varchar', { length: 100 })
  apellidos: string;

  @Column('varchar', { length: 20, nullable: true })
  telefono: string | null;

  @Column('varchar', { length: 30, default: 'coordinador' })
  role: string;

  @Column('datetime2', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('datetime2', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

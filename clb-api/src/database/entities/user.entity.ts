import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  cedula: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ default: 'coordinador' })
  role: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: string;
}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ElectoresModule } from './modules/electores/electores.module';
import { ComitesModule } from './modules/comites/comites.module';
import { LlamadasModule } from './modules/llamadas/llamadas.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database/clb.db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    ElectoresModule,
    ComitesModule,
    LlamadasModule,
    UsuariosModule,
  ],
})
export class AppModule {}
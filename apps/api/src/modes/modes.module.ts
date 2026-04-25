import { Module } from '@nestjs/common';
import { ModesService } from './modes.service';
import { ModesController } from './modes.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ModesService],
  controllers: [ModesController],
  exports: [ModesService],
})
export class ModesModule {}

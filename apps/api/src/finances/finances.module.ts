import { Module } from '@nestjs/common';
import { FinancesService } from './finances.service';
import { FinancialPatternService } from './financial-pattern.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [FinancesService, FinancialPatternService],
  exports: [FinancesService, FinancialPatternService],
})
export class FinancesModule {}

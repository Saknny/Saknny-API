import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '../../configs/database/database.module';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [HttpModule, DatabaseModule.forFeature([Payment])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}

import { Module } from '@nestjs/common';
import { SystemLogService } from './system-log.service';
import { SystemLogController } from './system-log.controller';
import { SystemLog } from '../entitys/system-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemLog]),
  ],
  controllers: [SystemLogController],
  providers: [SystemLogService],
  exports: [TypeOrmModule],
})
export class SystemLogModule {}

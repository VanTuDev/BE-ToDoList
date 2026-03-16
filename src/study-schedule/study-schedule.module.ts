import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyScheduleController } from './study-schedule.controller';
import { StudyScheduleService } from './study-schedule.service';
import { StudySchedule, StudyScheduleSchema } from './study-schedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudySchedule.name, schema: StudyScheduleSchema },
    ]),
  ],
  controllers: [StudyScheduleController],
  providers: [StudyScheduleService],
  exports: [StudyScheduleService],
})
export class StudyScheduleModule {}

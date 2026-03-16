import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { SeedService } from './seed.service';
import { AuthModule } from '../auth/auth.module';
import { ProfileModule } from '../profile/profile.module';
import { SubjectModule } from '../subject/subject.module';
import { TimetableModule } from '../timetable/timetable.module';
import { DailyTaskModule } from '../daily-task/daily-task.module';
import { StudyScheduleModule } from '../study-schedule/study-schedule.module';
import { StudyTaskModule } from '../study-task/study-task.module';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    SubjectModule,
    TimetableModule,
    DailyTaskModule,
    StudyScheduleModule,
    StudyTaskModule,
  ],
  controllers: [DataController],
  providers: [DataService, SeedService],
})
export class DataModule {}

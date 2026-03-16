import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './profile/profile.module';
import { SubjectModule } from './subject/subject.module';
import { TimetableModule } from './timetable/timetable.module';
import { DailyTaskModule } from './daily-task/daily-task.module';
import { StudyScheduleModule } from './study-schedule/study-schedule.module';
import { StudyTaskModule } from './study-task/study-task.module';
import { DataModule } from './data/data.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'] }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unitracker', {
      retryWrites: true,
    }),
    AuthModule,
    ProfileModule,
    SubjectModule,
    TimetableModule,
    DailyTaskModule,
    StudyScheduleModule,
    StudyTaskModule,
    DataModule,
  ],
})
export class AppModule {}

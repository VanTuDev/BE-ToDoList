import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyTaskController } from './study-task.controller';
import { StudyTaskService } from './study-task.service';
import { StudyTask, StudyTaskSchema } from './study-task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudyTask.name, schema: StudyTaskSchema },
    ]),
  ],
  controllers: [StudyTaskController],
  providers: [StudyTaskService],
  exports: [StudyTaskService],
})
export class StudyTaskModule {}

import { Injectable } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { SubjectService } from '../subject/subject.service';
import { TimetableService } from '../timetable/timetable.service';
import { DailyTaskService } from '../daily-task/daily-task.service';
import { StudyScheduleService } from '../study-schedule/study-schedule.service';
import { StudyTaskService } from '../study-task/study-task.service';

@Injectable()
export class DataService {
  constructor(
    private readonly profileService: ProfileService,
    private readonly subjectService: SubjectService,
    private readonly timetableService: TimetableService,
    private readonly dailyTaskService: DailyTaskService,
    private readonly studyScheduleService: StudyScheduleService,
    private readonly studyTaskService: StudyTaskService,
  ) {}

  /** Lấy toàn bộ state theo user (SĐT = userId). */
  async getFullState(userId: string) {
    const [
      profile,
      subjects,
      timetable,
      dailyTasks,
      studySchedules,
      studyTasks,
    ] = await Promise.all([
      this.profileService.getOrCreate(userId),
      this.subjectService.findAll(userId),
      this.timetableService.findAll(userId),
      this.dailyTaskService.findAll(userId),
      this.studyScheduleService.findAll(userId),
      this.studyTaskService.findAll(userId),
    ]);

    return {
      profile,
      subjects,
      timetable,
      assignments: [],
      exams: [],
      dailyTasks,
      studySchedules,
      studyTasks,
      studySessions: [],
      studyTimeByHour: [],
      deadlineStats: [],
      weeklyPressure: [],
      communityMembers: [],
      studyGroups: [],
      sharedDocuments: [],
    };
  }
}

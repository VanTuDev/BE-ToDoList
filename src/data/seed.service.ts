import { Injectable, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from '../profile/profile.service';
import { SubjectService } from '../subject/subject.service';
import { TimetableService } from '../timetable/timetable.service';

/** User demo – seed chỉ thêm cho SĐT này, không ảnh hưởng user khác */
const DEMO_PHONE = '0399604816';
const DEMO_PASSWORD = '123456';
const DEMO_PROFILE = {
  name: 'Nguyễn Văn Tú',
  studentId: 'DE170069',
  class: '',
  age: 0,
  email: '',
  major: '',
  semester: 'Spring 2026',
  campus: 'FPT University HCM',
  gpa: 0,
};

/** 5 môn cho user demo (chỉ dùng khi seed) */
const DEMO_SUBJECTS = [
  { code: 'SWP391', name: 'Software Development Project', credits: 3, instructor: 'Nguyen Thi Mai', room: 'DE-C301', color: '#f97316' },
  { code: 'SWR302', name: 'Software Requirement', credits: 3, instructor: 'Tran Van Binh', room: 'BE-B205', color: '#10b981' },
  { code: 'SWT301', name: 'Software Testing', credits: 3, instructor: 'Le Hoang Nam', room: 'DE-A404', color: '#8b5cf6' },
  { code: 'PRN231', name: 'Building Cross-Platform with .NET', credits: 3, instructor: 'Pham Quang Huy', room: 'DE-C302', color: '#ec4899' },
  { code: 'MLN131', name: 'Philosophy of Marxism-Leninism', credits: 3, instructor: 'Do Thi Lan', room: 'BE-A101', color: '#06b6d4' },
];

/** TKB cho user demo – subjectId là mã môn (code), map sang id sau khi tạo môn */
const DEMO_TIMETABLE: { subjectCode: string; day: number; startTime: string; endTime: string; room: string; type: 'lecture' | 'lab' | 'tutorial' }[] = [
  { subjectCode: 'SWP391', day: 0, startTime: '07:30', endTime: '09:30', room: 'DE-C301', type: 'lecture' },
  { subjectCode: 'SWR302', day: 0, startTime: '10:00', endTime: '12:00', room: 'BE-B205', type: 'lecture' },
  { subjectCode: 'SWT301', day: 1, startTime: '07:30', endTime: '09:30', room: 'DE-A404', type: 'lecture' },
  { subjectCode: 'PRN231', day: 1, startTime: '10:00', endTime: '12:00', room: 'DE-C302', type: 'lecture' },
  { subjectCode: 'SWP391', day: 1, startTime: '13:00', endTime: '15:00', room: 'LAB-C201', type: 'lab' },
  { subjectCode: 'MLN131', day: 2, startTime: '07:30', endTime: '09:30', room: 'BE-A101', type: 'lecture' },
  { subjectCode: 'SWR302', day: 2, startTime: '10:00', endTime: '12:00', room: 'BE-B205', type: 'tutorial' },
  { subjectCode: 'SWT301', day: 3, startTime: '07:30', endTime: '09:30', room: 'LAB-A301', type: 'lab' },
  { subjectCode: 'PRN231', day: 3, startTime: '10:00', endTime: '12:00', room: 'LAB-C202', type: 'lab' },
  { subjectCode: 'MLN131', day: 3, startTime: '13:00', endTime: '15:00', room: 'BE-A101', type: 'tutorial' },
  { subjectCode: 'SWP391', day: 4, startTime: '07:30', endTime: '09:30', room: 'DE-C301', type: 'lecture' },
  { subjectCode: 'SWT301', day: 4, startTime: '10:00', endTime: '12:00', room: 'DE-A404', type: 'tutorial' },
  { subjectCode: 'PRN231', day: 5, startTime: '08:00', endTime: '10:00', room: 'DE-C302', type: 'lecture' },
];

@Injectable()
export class SeedService {
  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService,
    private readonly subjectService: SubjectService,
    private readonly timetableService: TimetableService,
  ) {}

  /**
   * Tạo sẵn 1 user demo + profile + môn học + TKB.
   * Chỉ thêm cho SĐT 0399604816, không đụng đến dữ liệu user khác.
   */
  async seedDemoUser() {
    const userId = String(DEMO_PHONE).replace(/\D/g, '').trim() || DEMO_PHONE;

    try {
      await this.authService.register(DEMO_PHONE, DEMO_PASSWORD);
    } catch (e: unknown) {
      if (e instanceof ConflictException) {
        // User đã tồn tại, bỏ qua
      } else {
        throw e;
      }
    }

    await this.profileService.getOrCreate(userId);
    await this.profileService.update(userId, DEMO_PROFILE);

    const subjects = await this.subjectService.findAll(userId);
    if (subjects.length === 0) {
      const codeToId: Record<string, string> = {};
      for (const s of DEMO_SUBJECTS) {
        const created = await this.subjectService.create(userId, {
          code: s.code,
          name: s.name,
          credits: s.credits,
          instructor: s.instructor,
          room: s.room,
          color: s.color,
        });
        codeToId[s.code] = created.id;
      }

      const slots = await this.timetableService.findAll(userId);
      if (slots.length === 0) {
        for (const t of DEMO_TIMETABLE) {
          const subjectId = codeToId[t.subjectCode];
          if (subjectId) {
            await this.timetableService.create(userId, {
              subjectId,
              day: t.day,
              startTime: t.startTime,
              endTime: t.endTime,
              room: t.room,
              type: t.type,
            });
          }
        }
      }
    }

    return {
      message: 'Đã seed xong user demo',
      userId,
      phone: DEMO_PHONE,
      profile: DEMO_PROFILE.name,
      mssv: DEMO_PROFILE.studentId,
    };
  }
}

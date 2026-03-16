import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TimetableSlot, TimetableSlotSchema } from './timetable.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimetableSlot.name, schema: TimetableSlotSchema },
    ]),
  ],
  controllers: [TimetableController],
  providers: [TimetableService],
  exports: [TimetableService],
})
export class TimetableModule {}

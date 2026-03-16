export class CreateSubjectDto {
  code: string;
  name: string;
  credits?: number;
  instructor?: string;
  room?: string;
  color?: string;
}

export class UpdateSubjectDto {
  code?: string;
  name?: string;
  credits?: number;
  instructor?: string;
  room?: string;
  color?: string;
}

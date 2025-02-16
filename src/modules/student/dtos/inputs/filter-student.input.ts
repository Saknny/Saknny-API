import { IsOptional, IsString } from 'class-validator';

export class FilterStudentsInput {
  @IsString()
  @IsOptional()
  searchKey?: string;
}

export class StudentIdInput {
  @IsString()
  studentId: string;
}

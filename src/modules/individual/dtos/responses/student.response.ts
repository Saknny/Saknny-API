import { Expose, plainToInstance, Transform } from 'class-transformer';

export class StudentResponse {
  @Expose()
  isVisible: boolean;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  fullName: string;

  @Expose()
  bio: string;

  @Expose()
  socialAccount: string;
}

export class StudentWithIdResponse extends StudentResponse {
  @Expose()
  id: string;
}

export class StudentShortInfo {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  fullName: string;
}

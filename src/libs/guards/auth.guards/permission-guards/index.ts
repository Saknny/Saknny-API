import { AdminOnlyGuard } from './admin.guard';
import { OrganizationOnlyGuard } from './organization.guard';
import { AuthenticatedGuard } from './auth.guard';
import { StudentOnlyGuard } from './student.guard';

export const AuthGuards = {
  authenticated: AuthenticatedGuard,
  organization: OrganizationOnlyGuard,
  student: StudentOnlyGuard,
  admin: AdminOnlyGuard,
} as const;

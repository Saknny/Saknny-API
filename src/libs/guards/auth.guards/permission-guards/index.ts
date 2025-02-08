import { AdminOnlyGuard } from './admin.guard';
import { ProviderOnlyGuard } from './provider.guard';
import { AuthenticatedGuard } from './auth.guard';
import { StudentOnlyGuard } from './student.guard';

export const AuthGuards = {
  authenticated: AuthenticatedGuard,
  provider: ProviderOnlyGuard,
  student: StudentOnlyGuard,
  admin: AdminOnlyGuard,
} as const;

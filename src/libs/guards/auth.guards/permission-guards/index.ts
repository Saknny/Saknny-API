import { AdminOnlyGuard } from './admin.guard';
import { OrganizationOnlyGuard } from './organization.guard';
import { AuthenticatedGuard } from './auth.guard';
import { IndividualOnlyGuard } from './individual.guard';

export const AuthGuards = {
  authenticated: AuthenticatedGuard,
  organization: OrganizationOnlyGuard,
  individual: IndividualOnlyGuard,
  admin: AdminOnlyGuard,
} as const;

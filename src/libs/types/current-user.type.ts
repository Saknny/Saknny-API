import { Session } from '../../modules/session/entities/session.entity';
import { User } from '../../modules/user/entities/user.entity';

export type currentUserType = User & {
  session?: Session;
};

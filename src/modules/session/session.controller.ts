import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/inputs/create-session.dto';
import { UpdateSessionDto } from './dto/inputs/update-session.dto';
import { currentUser } from '../../libs/decorators/currentUser.decorator';
import { currentUserType } from '../../libs/types/current-user.type';
import { JwtAuthenticationGuard } from '../../libs/guards/strategy.guards/jwt.guard';
import { Auth } from '@src/libs/decorators/auth.decorator';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Delete()
  @Auth({ allow: 'authenticated' })
  remove(@currentUser() user: currentUserType) {
    return this.sessionService.remove(user.session);
  }
}

import {
  Controller,
  Post,
  Delete,
  Patch,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import { FavoriteListService } from '../services/favorite-list.service';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { User } from '@src/modules/user/entities/user.entity';

@Controller('favorite-lists')
export class FavoriteListController {
  constructor(private readonly favoriteListService: FavoriteListService) {}

  @Post()
  createFavoriteList(@currentUser() user: User, @Body('name') name: string) {
    if (!user?.student) throw new Error('Student not found');

    return this.favoriteListService.createFavoriteList(user.student.id, name);
  }

  @Patch(':id')
  renameFavoriteList(
    @Param('id') listId: string,
    @currentUser() user: User,
    @Body('name') newName: string,
  ) {
    if (!user?.student) throw new Error('Student not found');

    return this.favoriteListService.renameFavoriteList(
      user.student.id,
      listId,
      newName,
    );
  }

  @Delete(':id')
  deleteFavoriteList(@Param('id') listId: string, @currentUser() user: User) {
    if (!user?.student) throw new Error('Student not found');

    return this.favoriteListService.deleteFavoriteList(user.student.id, listId);
  }

  @Post(':id/apartments')
  addApartmentToFavoriteList(
    @Param('id') listId: string,
    @currentUser() user: User,
    @Body('apartmentId') apartmentId: string,
  ) {
    if (!user?.student) throw new Error('Student not found');

    return this.favoriteListService.addApartmentToFavoriteList(
      user.student.id,
      listId,
      apartmentId,
    );
  }

  @Delete('apartments/:apartmentId')
  removeApartmentFromFavoriteList(
    @currentUser() user: User,
    @Param('apartmentId') apartmentId: string,
  ) {
    if (!user?.student) throw new Error('Student not found');

    return this.favoriteListService.removeApartmentFromFavoriteList(
      user.student.id,
      apartmentId,
    );
  }

  @Get('my-favorite-lists')
  getStudentFavoriteLists(@currentUser() user: User) {
    if (!user?.student) throw new Error('Student not found');
    return this.favoriteListService.getStudentFavoriteLists(user.student.id);
  }

  @Get(':id/apartments')
  getFavoriteListApartments(
    @Param('id') listId: string,
    @currentUser() user: User,
  ) {
    if (!user?.student) throw new Error('Student not found');

    return this.favoriteListService.getFavoriteListApartments(
      user.student.id,
      listId,
    );
  }
}

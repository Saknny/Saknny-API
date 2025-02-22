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

@Controller('favorite-lists')
export class FavoriteListController {
  constructor(private readonly favoriteListService: FavoriteListService) {}

  @Post()
  createFavoriteList(
    @Body('studentId') studentId: string,
    @Body('name') name: string,
  ) {
    return this.favoriteListService.createFavoriteList(studentId, name);
  }

  @Patch(':id')
  renameFavoriteList(
    @Param('id') listId: string,
    @Body('studentId') studentId: string,
    @Body('name') newName: string,
  ) {
    return this.favoriteListService.renameFavoriteList(
      studentId,
      listId,
      newName,
    );
  }

  @Delete(':id')
  deleteFavoriteList(
    @Param('id') listId: string,
    @Body('studentId') studentId: string,
  ) {
    return this.favoriteListService.deleteFavoriteList(studentId, listId);
  }

  @Post(':id/apartments')
  addApartmentToFavoriteList(
    @Param('id') listId: string,
    @Body('studentId') studentId: string,
    @Body('apartmentId') apartmentId: string,
  ) {
    return this.favoriteListService.addApartmentToFavoriteList(
      studentId,
      listId,
      apartmentId,
    );
  }

  @Delete('apartments/:apartmentId')
  removeApartmentFromFavoriteList(
    @Body('studentId') studentId: string,
    @Param('apartmentId') apartmentId: string,
  ) {
    return this.favoriteListService.removeApartmentFromFavoriteList(
      studentId,
      apartmentId,
    );
  }

  @Get(':userId')
  getUserFavoriteLists(@Param('userId') userId: number) {
    return this.favoriteListService.getUserFavoriteLists(userId);
  }

  @Get(':id/apartments')
  getFavoriteListApartments(
    @Param('id') listId: string,
    @Body('studentId') studentId: string,
  ) {
    return this.favoriteListService.getFavoriteListApartments(
      studentId,
      listId,
    );
  }
}

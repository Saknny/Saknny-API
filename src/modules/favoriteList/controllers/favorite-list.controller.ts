import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FavoriteService } from '../services/favorite-list.service';
import { UpdateFavoriteInput } from '../Dto/update-favorite.dto';
import { currentUser } from '@src/libs/decorators/currentUser.decorator';
import { currentUserType } from '@src/libs/types/current-user.type';

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get('')
  async getFavoriteLists(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @currentUser() user: currentUserType,
  ) {
    const studentId = user?.student?.id;
    if (!studentId) throw new Error('Student not logged in');

    return this.favoriteService.getFavoriteLists(studentId, { limit, page });
  }

  @Post()
  async createFavorite(
    @Body() body: { name: string },
    @currentUser() user: currentUserType,
  ) {
    const studentId = user?.student?.id;
    if (!studentId) throw new Error('Student not logged in');

    return this.favoriteService.createFavorite(body.name, studentId);
  }

  @Post('/update')
  async updateFavorite(@Body() input: UpdateFavoriteInput) {
    return this.favoriteService.updateFavorite(input);
  }

  @Delete('/:favoriteId')
  async deleteFavorite(@Param('favoriteId') favoriteId: string) {
    return this.favoriteService.deleteFavorite(favoriteId);
  }

  @Post('/add-apartment')
  async addApartmentToFavoriteList(
    @Body()
    body: {
      apartmentId: string;
    },
    @currentUser() user: currentUserType,
  ) {
    const studentId = user?.student?.id;
    if (!studentId) throw new Error('Student not logged in');

    return this.favoriteService.addApartmentToFavoriteList(
      body.apartmentId,
      studentId,
    );
  }

  @Delete('/remove-apartment/:apartmentId')
  async removeApartmentFromFavoriteList(
    @Param('apartmentId') apartmentId: string,
    @currentUser() user: currentUserType,
  ) {
    const studentId = user?.student?.id;
    if (!studentId) throw new Error('Student not logged in');

    return this.favoriteService.removeApartmentFromFavoriteList(
      apartmentId,
      studentId,
    );
  }

  @Get('/list-apartments')
  async getApartmentsForFavoriteList(
    @Query('limit') limit: number,
    @Query('page') page: number,
    @currentUser() user: currentUserType
  ) {
    const studentId = user?.student?.id;
    return this.favoriteService.getApartmentsForFavoriteList( studentId,{
      limit,
      page,
    });
  }

  @Get('/count/:favoriteId')
  async getApartmentsCount(@Param('favoriteId') favoriteId: string) {
    return this.favoriteService.getApartmentsCount(favoriteId);
  }

  @Get('/added/:apartmentId')
  async addedToFavoriteList(
    @Param('apartmentId') apartmentId: string,
    @currentUser() user: currentUserType,
  ) {
    const studentId = user?.student?.id;
    if (!studentId) throw new Error('Student not logged in');

    return this.favoriteService.addedToFavoriteList(apartmentId, studentId);
  }
}

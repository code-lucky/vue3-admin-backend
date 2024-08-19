import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) { }

  @Get('list')
  async getList() {
    return await this.navigationService.getList();
  }

  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    return await this.navigationService.getNavigationById(+id);
  }

  @Post('create')
  async create(@Body() createNavigationDto: CreateNavigationDto) {
    return await this.navigationService.createNavigation(createNavigationDto);
  }

  @Post('update')
  async update(@Body() updateNavigationDto: UpdateNavigationDto) {
    return await this.navigationService.updateNavigation(updateNavigationDto);
  }

  @Post('delete/:id')
  async remove(@Param('id') id: string) {
    return await this.navigationService.delNavigation(+id);
  }
}

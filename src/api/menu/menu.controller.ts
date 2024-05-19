import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { MenuService } from './menu.service';
import { RequireLogin } from 'src/decorator/custom.decorator';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@RequireLogin()
@Controller('menu')
export class MenuController {
  
  @Inject(MenuService)
  private menuService: MenuService;

  @Get('menuList')
  async getMenuList() {
    return this.menuService.menuList();
  }

  @Post('createMenu')
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.createMenu(createMenuDto);
  }

  @Post('updateMenu')
  async updateMenu(@Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.modifMenu(updateMenuDto);
  }

  @Get('treeMenu')
  async treeMenu() {
    return this.menuService.treeMenu();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entitys/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Injectable()
export class MenuService {

  @InjectRepository(Menu)
  private menuRepository: Repository<Menu>;

  /**
   * 
   * @returns 获取菜单列表
   */
  async menuList() {
    const menuList = await this.menuRepository.
      createQueryBuilder().
      select([
        'menu.id AS id',
        'menu.menu_name AS menu_name',
        'menu.pid AS pid',
        'menu.menu_path AS menu_path',
        'menu.menu_component AS menu_component',
        'menu.menu_icon AS menu_icon',
        'menu.sort AS sort',
        'menu.create_time AS create_time',
      ]).where('menu.is_delete = 0')
      .orderBy('menu.sort', 'DESC')
      .getRawMany();
    return menuList;
  }


  /**
   * 
   * @param menuDto 创建菜单的dto
   * @returns 
   */
  async createMenu(menuDto: CreateMenuDto) {
    const menu = new Menu();
    menu.menu_name = menuDto.menu_name;
    menu.pid = menuDto.pid;
    menu.menu_path = menuDto.menu_path;
    menu.menu_component = menuDto.menu_component;
    menu.menu_icon = menuDto.menu_icon;
    menu.sort = menuDto.sort;

    try {
      await this.menuRepository.save(menu);
      return '创建菜单成功';
    } catch (e) {
      throw new Error('创建菜单失败');
    }
  }

  /**
   * 
   * @param menuDto 更新菜单的dto
   * @returns 
   */
  async modifMenu(menuDto: UpdateMenuDto) {
    const menu = new Menu();
    menu.id = menuDto.id;
    menu.menu_name = menuDto.menu_name;
    menu.pid = menuDto.pid;
    menu.menu_path = menuDto.menu_path;
    menu.menu_component = menuDto.menu_component;
    menu.menu_icon = menuDto.menu_icon;
    menu.sort = menuDto.sort;

    try {
      await this.menuRepository.save(menu);
      return '修改菜单成功';
    } catch (e) {
      throw new Error('修改菜单失败');
    }
  }
}

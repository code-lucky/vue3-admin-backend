import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { In, Repository } from 'typeorm';
import { Role } from '../entitys/role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoleService {
  
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;


  /**
   * 
   * @returns 获取角色列表
   */
  async roleList() {

    const roleList = this.roleRepository
    .createQueryBuilder()
    .select([
      'role.id AS id',
      'role.role_name AS role_name',
      'role.create_time AS create_time',
      'role.update_time AS update_time',
    ])
    .where('role.is_delete = 0')
    .getRawMany();

    return roleList;
  }
}

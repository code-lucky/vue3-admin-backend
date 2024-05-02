import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RequireLogin } from 'src/decorator/custom.decorator';

@RequireLogin()
@Controller('role')
export class RoleController {
  
  @Inject(RoleService)
  private roleService: RoleService;

  @Get('roleList')
  async getRoleList() {
    return this.roleService.roleList();
  }
}

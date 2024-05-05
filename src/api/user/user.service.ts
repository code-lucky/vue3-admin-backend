import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entitys/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils/md5';
import { LoginDto } from './dto/login.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { Role } from '../entitys/role.entity';
import { UpdatePasswordDto } from './dto/update_paddword.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UserService {

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(RedisService)
  private redisService: RedisService;

  /**
   * 用户登录
   * @param user 
   */
  async login(user: LoginDto) {
    const findUser = await this.userRepository.findOne({
      where: {
        user_name: user.user_name,
        is_delete: 0
      }
    });
    if (!findUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (findUser.password !== md5(user.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    const vo = new LoginUserVo();
    vo.userInfo = {
      id: findUser.id,
      user_name: findUser.user_name,
      head_pic: findUser.head_pic,
      create_time: findUser.create_time
    };

    return vo;
  }

  /**
   * 获取用户信息
   * @param userId 
   */
  async getUserInfo(userId: number) {
    const userInfo = await this.userRepository.createQueryBuilder()
      .select([
        'user.id AS id',
        'user.user_name AS user_name',
        'user.head_pic AS head_pic',
        'user.create_time AS create_time',
        'role.id AS role_id',
        'role.role_name AS role_name'
      ])
      .leftJoin(Role, 'role', 'role.id = user.roleId')
      .where('user.id = :id and user.is_delete = 0', { id: userId })
      .getRawOne();
    
    if(!userInfo) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    return userInfo;
  }

  /**
   * 添加用户
   * @param user 
   */
  async createUser(user: CreateUserDto) {
    const findUser = await this.userRepository.findOne({
      where: {
        user_name: user.user_name,
        is_delete: 0
      }
    });

    if (findUser) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }

    try {
      const addUser = new User();
      addUser.user_name = user.user_name;
      addUser.password = md5(user.password);
      addUser.head_pic = user.head_pic;
      addUser.roleId = user.roleId;
      await this.userRepository.save(addUser);
      return '添加用户成功';
    } catch (e) {
      throw new HttpException('添加用户失败', HttpStatus.BAD_REQUEST);
    }
  }


  /**
   * 
   * @param userId 用户id
   * @param passwordDto 密码dto
   * @returns 
   */
  async updatePassword(userId: number, passwordDto: UpdatePasswordDto) {
    const findUser = await this.userRepository.findOne({
      where: {
        id: userId,
        is_delete: 0
      }
    });

    if (!findUser) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (findUser.password !== md5(passwordDto.old_password)) {
      throw new HttpException('原密码错误', HttpStatus.BAD_REQUEST);
    }

    if (passwordDto.password !== passwordDto.confirm_password) {
      throw new HttpException('两次密码不一致', HttpStatus.BAD_REQUEST);
    }

    try {
      findUser.password = md5(passwordDto.password);
      await this.userRepository.save(findUser);
      return '修改密码成功';
    } catch (err) {
      throw new HttpException('修改密码失败', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 
   * @param userId 用户id
   * @param userDto 用户dto
   * @returns 
   */
  async modifyUser(userId: number, userDto: UpdateUserDto) {
    
    const user = new User();
    user.id = userId;
    user.user_name = userDto.user_name;
    user.head_pic = userDto.head_pic;

    try{
      await this.userRepository.save(user);
      return '修改用户成功';
    }catch(err){
      throw new HttpException('修改用户失败', HttpStatus.BAD_REQUEST);
    }
    
  }
}

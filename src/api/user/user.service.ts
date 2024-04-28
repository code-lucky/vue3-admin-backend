import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createQueryBuilder, getConnection, getManager, getRepository, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entitys/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils/md5';
import { LoginDto } from './dto/login.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { Role } from '../entitys/role.entity';
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
        isDelete: 0
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
    const userInfo = await getConnection()
      .createQueryBuilder()
      .select([
        'user.id AS id',
        'user.user_name AS user_name',
        'role.roleName AS role_name' // 修改为 roleName
      ])
      .from(User, 'user')
      .leftJoin(Role, 'role', 'role.id = user.roleId')
      .where('user.id = :id', { id: userId })
      .getRawOne();

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
        isDelete: 0
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
}

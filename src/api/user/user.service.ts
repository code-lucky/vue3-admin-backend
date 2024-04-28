import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entitys/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils/md5';
import { LoginDto } from './dto/login.dto';
import { LoginUserVo } from './vo/login-user.vo';
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
        email: user.email,
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
      user_name: findUser.userName,
      email: findUser.email,
      head_pic: findUser.head_pic,
      phone_number: findUser.phone_number
    };

    return vo;
  }

  /**
   * 获取用户信息
   * @param userId 
   */
  async getUserInfo(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isDelete: 0
      }
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    return user;
  }


  /**
   * 更新用户信息
   * @param userId 
   * @param user 
   */
  async updatePassword(userId: number,passwordDto: UpdatePasswordDto) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isDelete: 0
      }
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(passwordDto.old_password)) {
      throw new HttpException('原密码错误', HttpStatus.BAD_REQUEST);
    }

    if (passwordDto.new_password !== passwordDto.confirm_password) {
      throw new HttpException('两次密码不一致', HttpStatus.BAD_REQUEST);
    }

    user.password = md5(passwordDto.new_password);
    try {
      await this.userRepository.save(user);
      return '密码修改成功';
    } catch (error) {
      throw new HttpException('密码修改失败', HttpStatus.BAD_REQUEST);
    }
  }
}

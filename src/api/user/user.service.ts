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
import { EmailService } from '../email/email.service';
import { changeEmailDto } from './dto/change-email.dto';
@Injectable()
export class UserService {

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

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
        'user.email AS email',
        'user.create_time AS create_time',
        'role.id AS role_id',
        'role.role_name AS role_name'
      ])
      .leftJoin(Role, 'role', 'role.id = user.roleId')
      .where('user.id = :id and user.is_delete = 0', { id: userId })
      .getRawOne();

    if (!userInfo) {
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

    try {
      await this.userRepository.save(user);
      return '修改用户成功';
    } catch (err) {
      throw new HttpException('修改用户失败', HttpStatus.BAD_REQUEST);
    }

  }

  /**
   * 
   * @param emailObj 修改邮箱obj
   * @param userId 
   * @returns 
   */
  async changeEmail(emailObj: changeEmailDto, userId: number) {
    const { current_email, email, captcha } = emailObj;

    if (current_email === email) {
      throw new HttpException('新邮箱不能和旧邮箱相同', HttpStatus.BAD_REQUEST);
    }

    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
      throw new HttpException('邮箱格式不正确', HttpStatus.BAD_REQUEST);
    }

    const code = await this.redisService.get(`change_email_captcha_${email}`);
    if (code !== captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({
      where: {
        email: email,
        is_delete: 0
      }
    });

    if (user) {
      throw new HttpException('该邮箱已被使用', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.userRepository.update(userId, {
        email: email
      });

      await this.redisService.del(`change_email_captcha_${email}`);

      return '修改邮箱成功';
    } catch (e) {
      throw new HttpException('修改邮箱失败', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 
   * @param email 邮箱地址
   * @param userId 
   * @returns 
   */
  async sendEmailCode(email: string, userId: number) {
    if (!email) {
      throw new HttpException('邮箱不能为空', HttpStatus.BAD_REQUEST);
    }

    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
      throw new HttpException('邮箱格式不正确', HttpStatus.BAD_REQUEST);
    }

    try {
      const code = Math.floor(Math.random() * 1000000).toString();
      await this.redisService.set(`change_email_captcha_${email}`, code, 60 * 5);
      await this.emailService.sendMail({
        to: email,
        subject: '注册验证码',
        html: `<p>您修改邮箱的验证码是 ${code}</p>`
      });
      return '发送成功';
    } catch (e) {
      throw new HttpException('发送邮件失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

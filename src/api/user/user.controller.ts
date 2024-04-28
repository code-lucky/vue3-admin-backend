import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, HttpStatus, Query, Req, HttpException } from '@nestjs/common';
import { UserService } from './user.service';
import { EmailService } from 'src/api/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { RequireLogin } from 'src/decorator/custom.decorator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private userService: UserService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  /**
   * 登录
   * @param user 
   * @returns 
   */
  @Post('login')
  async userLogin(@Body() user: LoginDto) {
    const vo = await this.userService.login(user)
    vo.access_token = this.jwtService.sign({
      userId: vo.userInfo.id,
      username: vo.userInfo.user_name
    }, {
      expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m'
    })

    vo.refresh_token = this.jwtService.sign({
      userId: vo.userInfo.id
    }, {
      expiresIn: this.configService.get('jwt_refresh_token_expres_time') || '7d'
    });
    return vo;
  }
  
  @RequireLogin()
  @Post('addUser')
  async addUser(@Body() user: CreateUserDto){
    return await this.userService.createUser(user);
  }

  @RequireLogin()
  @Get('userInfo')
  async getUserInfo(@Req() req: Request){
    return await this.userService.getUserInfo(req.user.userId);
  }
}

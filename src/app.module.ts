import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './api/user/user.module';
import { EmailModule } from './api/email/email.module';
import { WinstonModule } from './winston/winston.module';
import { format, transports } from 'winston';
import * as chalk from 'chalk';
import { Constant } from './utils/constant';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoginGuard } from './guard/login.guard';
import { FileModule } from './api/file/file.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MenuModule } from './api/menu/menu.module';
import { RoleModule } from './api/role/role.module';
import { RoleDataModule } from './api/role-data/role-data.module';
import { SystemLogModule } from './api/system-log/system-log.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { NavigationModule } from './api/navigation/navigation.module';
import { ArticleModule } from './api/article/article.module';
import { Article } from './api/entitys/article.entity';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // 图片文件夹的路径
      serveRoot: '/api/images', // 将静态文件服务到 /images 路径
    }),
    WinstonModule.forRoot({
      level: 'debug',
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ context, level, message, time }) => {
              const appStr = chalk.green(`[NEST]`);
              const contextStr = chalk.yellow(`[${context}]`);

              return `${appStr} ${time} ${level} ${contextStr} ${message} `;
            })
          ),

        }),
        new transports.File({
          format: format.combine(
            format.timestamp(),
            format.json()
          ),
          filename: `loggger-${Constant.CURRENT_DATE}-${Constant.TIMESTAMP}.log`,
          dirname: `log/${Constant.CURRENT_DATE}`,
          maxsize: 1024 * 1024
        })
      ]
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: '30m' // 默认30分钟
          }
        };
      },
      inject: [ConfigService],
      imports: undefined
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: 'src/.env'
      envFilePath: 'src/.env.local'
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          type: "mysql",
          host: configService.get('mysql_server_host'),
          port: configService.get('mysql_server_port'),
          username: configService.get('mysql_server_username'),
          password: configService.get('mysql_server_password'),
          database: configService.get('mysql_server_database'),
          synchronize: true,
          logging: true,
          // entities: [__dirname + '/**/*.entity{.ts,.js}'],
          entities: [Article],
          poolSize: 10,
          connectorPackage: 'mysql2',
          extra: {
            authPlugin: 'sha256_password',
          },
        };
      },
      inject: [ConfigService],
      imports: undefined
    }),
    RedisModule,
    EmailModule,
    UserModule,
    FileModule,
    MenuModule,
    RoleModule,
    RoleDataModule,
    SystemLogModule,
    NavigationModule,
    ArticleModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }

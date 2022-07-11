import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './lib/middleware/logger.middleware';
import { UtilModule } from './modules/util/util.module';
import { LastLoginInterceptor } from './lib/interceptor/last.login.interceptor';

@Module({
  imports: [
    UtilModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? './env/.config.env'
          : process.env.NODE_ENV === 'stage'
          ? './env/.config.env'
          : './env/.config.env',
    }),
  ],
  controllers: [],
  providers: [LastLoginInterceptor],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/');
    //consumer.apply(AuthMiddleware).forRoutes('/auth/test')
  }
}

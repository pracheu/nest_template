import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as AWS from 'aws-sdk';
import helmet from 'helmet';
// import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
// import fastifyHelmet from 'fastify-helmet'
import { AppModule } from './app.module';
//import fmp from 'fastify-multipart'
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import { HttpExceptionFilter } from './lib/filter/http.exception.filter';

async function bootstrap() {
  // const ssmClient = new AWS.SSM({
  //   region: 'ap-northeast-2',
  // });

  // ssmClient.getParameter(
  //   {
  //     Name: `/lhire/database`,
  //     WithDecryption: true,
  //   },
  //   (err, data) => {
  //     if (data.Parameter) {
  //       global.db_info = JSON.parse(data.Parameter.Value);
  //       console.log(db_info);
  //     }
  //   },
  // );

  // ssmClient.getParameter(
  //   {
  //     Name: `/lhire/s3`,
  //     WithDecryption: true,
  //   },
  //   (err, data) => {
  //     if (data.Parameter) {
  //       global.s3_info = JSON.parse(data.Parameter.Value);
  //     }
  //   },
  // );

  const app = await NestFactory.create(AppModule);
  //const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())
  const config = new DocumentBuilder()
    .setTitle('번개채용')
    .setDescription('번개채용 API')
    .setVersion('1.0')
    .addTag('LH')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.use(cookieParser());
  if (process.env.NODE_ENV !== 'dev') {
    console.log(1);
    app.use(helmet());
  } else {
    app.use(helmet({ contentSecurityPolicy: false }));
  }

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });
  //app.register(fastifyHelmet)
  app.use(logger('dev'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  //setupSwagger(app)
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(30001);
}
bootstrap();

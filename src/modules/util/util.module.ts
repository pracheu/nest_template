import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { FireBaseService } from './firebase.service';
import { UtilService } from './util.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [DatabaseService, UtilService, FireBaseService],
  exports: [DatabaseService, UtilService, FireBaseService],
})
export class UtilModule {
  constructor() {}
}

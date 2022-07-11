import { IsArray, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ErrorCode } from './enum/error.enum';

export class ErrorDto {
  @IsEnum(ErrorCode)
  result_code: ErrorCode;

  @IsString()
  result_msg: string;

  @IsString()
  log_msg: string;

  @IsString()
  message: string;

  @IsArray()
  @IsOptional()
  result_data?: unknown;

  constructor(result_code, result_msg, log_msg, result_data?) {
    this.result_code = result_code;
    this.result_msg = result_msg;
    this.log_msg = log_msg;
    if (result_data != undefined) {
      this.result_data = result_data;
    }
  }
}

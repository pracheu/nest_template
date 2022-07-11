import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';

export class ResponseDto<T> {
  @ApiProperty({ description: '결과 코드' })
  @IsString()
  result_code: string;

  @ApiProperty({ description: '결과 메세지' })
  @IsString()
  result_msg: string;

  @ApiProperty({ description: '결과데이터' })
  @ValidateNested()
  result_data?: T;

  constructor(result_data?: T, result_code = '0', result_msg = 'SUCCESS') {
    this.result_code = result_code;
    this.result_msg = result_msg;
    this.result_data = result_data;
  }
}

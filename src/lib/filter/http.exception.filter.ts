import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from 'src/dto/common/enum/error.enum';
import { ErrorDto } from 'src/dto/common/error.http.dto';
import { ResponseDto } from 'src/dto/common/response.dto';
import { UtilService } from 'src/modules/util/util.service';
import * as requestIp from '@supercharge/request-ip';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message: ErrorDto = Object(exception.getResponse());
    console.error({
      ip: requestIp.getClientIp(request),
      statusCode: status,
      timestamp: UtilService.setMomentDate('YYYY-MM-DD HH:mm:ss'),
      path: request.url,
      message: message.log_msg ? message.log_msg : message.message,
    });
    // response.status(status).json({
    //   statusCode: status,
    //   timestamp: UtilService.setMomentDate('YYYY-MM-DD HH:mm:ss'),
    //   path: request.url,
    //   message: message.message,
    // });
    //console.log(message);

    if (status !== HttpStatus.NOT_FOUND) {
      response
        .status(status)
        .json(
          new ResponseDto(
            message.result_data ? message.result_data : [],
            message.result_code ? message.result_code : ErrorCode.REQUEST_ERROR,
            message.result_msg ? message.result_msg : 'FAIL',
          ),
        );
    }
  }
}

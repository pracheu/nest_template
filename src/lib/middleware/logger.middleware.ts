import { Injectable, NestMiddleware } from '@nestjs/common';
import * as requestIp from '@supercharge/request-ip';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log(`Request IP = ${requestIp.getClientIp(req)}`);
    console.log(`Request Url = ${req.method} ${req.url}`);
    if (req.method !== 'GET') {
      console.log(`Request Data = ${JSON.stringify(req.body)}`);
    }
    next();
  }
}

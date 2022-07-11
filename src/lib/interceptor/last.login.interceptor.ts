import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/modules/util/database.service';
import { UtilService } from 'src/modules/util/util.service';

@Injectable()
export class LastLoginInterceptor implements NestInterceptor {
  constructor(private db: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const [req, res] = context.getArgs();
    if (req.user) {
      //console.log(`LastLoginInterceptor .... m_no = ${req.user.ns_no} user Login Check!!!`);
      this.db
        .writeQueryOne(
          `UPDATE lhire.tbl_member SET m_last_login_dt = '${UtilService.setMomentDate(
            'YYYY-MM-DD HH:mm:ss',
          )}' WHERE m_no = ${req.user.ns_no}`,
          null,
        )
        .catch((error) => {
          console.log(error);
        });
    }
    // const now = Date.now();
    // return next.handle().pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
    return next.handle();
  }
}

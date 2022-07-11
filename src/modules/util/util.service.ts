import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import * as crypto from 'crypto';
import * as moment from 'moment';
import 'moment-timezone';
import { catchError, lastValueFrom, map } from 'rxjs';
moment.tz.setDefault('Asia/Seoul');

@Injectable()
export class UtilService {
  constructor(private httpService: HttpService) {}

  /**
   * 나이 계산기
   * @param date {string} 날짜 문자열 YYYY-MM-DD
   */
  static ageCalculator(date: string) {
    return new Date().getFullYear() - Number(date.split('-')[0]) + 1;
  }

  /**
   * 날짜 포맷터
   * @param format {string} 포맷 형식 예)YYYY-MM-DD
   * @param date {any} 시간 (날짜) 미입력 시 현재 시간
   */
  static setMomentDate(format: string, date?: any): string {
    if (date === undefined || date === null) {
      return moment().format(format);
    }
    return moment(date).format(format);
  }

  async cryptoMakerText(data: string): Promise<string> {
    const cipher: crypto.Cipher = crypto.createCipheriv(
      process.env.CRYPTO_ALGORITHM,
      process.env.CRYPTO_KEY,
      process.env.CRYPTO_IV,
    );
    let cryptoResult = cipher.update(data, 'utf8', 'base64');
    cryptoResult += cipher.final('base64');

    return cryptoResult;
  }

  async decryptoText(data: string): Promise<string> {
    const decipher: crypto.Decipher = crypto.createDecipheriv(
      process.env.CRYPTO_ALGORITHM,
      process.env.CRYPTO_KEY,
      process.env.CRYPTO_IV,
    );
    let decryptoResult = decipher.update(data, 'base64', 'utf8');
    decryptoResult += decipher.final('utf8');

    return decryptoResult;
  }

  async httpPostRequest(url: string, data?: any, options?: AxiosRequestConfig) {
    const result = await lastValueFrom(this.httpService.post(url, data, options).pipe(map((res) => res.data))).catch(
      (err) => {
        return err.response.data;
      },
    );
    return result;
  }

  async httpPatchRequest(url: string, data?: any, options?: AxiosRequestConfig) {
    const result = await lastValueFrom(this.httpService.patch(url, data, options).pipe(map((res) => res.data))).catch(
      (err) => {
        return err.response.data;
      },
    );
    return result;
  }

  async httpDeleteRequest(url: string, options?: AxiosRequestConfig) {
    const result = await lastValueFrom(this.httpService.delete(url, options).pipe(map((res) => res.data))).catch(
      (err) => {
        return err.response.data;
      },
    );
    return result;
  }

  async httpGetRequest(url: string, data?: any, options?: AxiosRequestConfig) {
    if (data != undefined) {
      url +=
        '?' +
        Object.entries(data)
          .map((e) => e.join('='))
          .join('&');
    }
    const result = await lastValueFrom(this.httpService.get(url, options).pipe(map((res) => res.data))).catch((err) => {
      return err.response.data;
    });
    return result;
  }

  static verifyCode() {
    let verifyCode = '';
    for (let i = 0; i < 6; i++) {
      verifyCode += Math.floor(Math.random() * 10);
    }
    return verifyCode;
  }

  static calLastLogin(date: string) {
    const today = new Date();
    const dift = today.getTime() - new Date(date).getTime();
    if (dift < 60 * 60 * 1000) {
      return (Math.floor(dift / 1000 / 60) === 0 ? '1' : Math.floor(dift / 1000 / 60)) + '분 전 접속';
    } else if (dift < 24 * 60 * 60 * 1000) {
      return Math.floor(dift / 1000 / 60 / 60) + '시간 전 접속';
    } else if (dift < 30 * 24 * 60 * 60 * 1000) {
      return Math.floor(dift / 1000 / 60 / 60 / 24) + '일 전 접속';
    } else if (dift < 30 * 24 * 60 * 60 * 1000 * 4) {
      return Math.floor(dift / 1000 / 60 / 60 / 24 / 30) + '개월 전 접속';
    } else {
      return '3개월 이상 미접속';
    }
  }

  static calAnnounceLong(date: string) {
    const today = new Date();
    const dift = today.getTime() - new Date(date).getTime();
    if (dift < 60 * 60 * 1000) {
      return (Math.floor(dift / 1000 / 60) === 0 ? '1' : Math.floor(dift / 1000 / 60)) + '분 전 시작';
    } else if (dift < 24 * 60 * 60 * 1000) {
      return Math.floor(dift / 1000 / 60 / 60) + '시간 전 시작';
    } else if (dift < 30 * 24 * 60 * 60 * 1000) {
      return Math.floor(dift / 1000 / 60 / 60 / 24) + '일 전 시작';
    } else if (dift < 30 * 24 * 60 * 60 * 1000 * 4) {
      return Math.floor(dift / 1000 / 60 / 60 / 24 / 30) + '개월 전 시작';
    } else {
      return '3개월 이상 전 시작';
    }
  }

  async mapper<T>(Clazz: { new (): T }, json: any) {
    const origin: any = new Clazz();
    const keyList = Object.keys(json);
    console.log('origin----------------');
    console.log(origin);
    console.log('json----------------');
    console.log(json);

    for (const key of keyList) {
      //console.log(key)
      let has = false;

      if (Array.isArray(json[key]) && Object.prototype.hasOwnProperty.call(origin, key)) {
        has = true;
      } else if (json[key] && Object.prototype.hasOwnProperty.call(origin, key)) {
        has = true;
      }
      // console.log(json[key])
      // console.log(Object.prototype.hasOwnProperty.call(origin, key))
      if (has) {
        origin[key] = json[key];
      }
    }

    return origin;
  }

  async sendKakao(phone: string, params: any, plus_id: string, template_code: string) {
    const templateParameter = {};
    const key = Object.keys(params);
    key.forEach((element) => {
      const i = 0;
      console.log(element);
      templateParameter[element] = params[element];
    });
    //templateParameter['인증번호'] = UtilService.verifyCode();

    const json = {
      recipientNo: phone,
      templateParameter: templateParameter,
    };

    const recipientListData = [];
    recipientListData.push(json);

    const body = {
      plusFriendId: '@dailyalba',
      templateCode: 'cert_220113',
      recipientList: recipientListData,
    };

    const options = {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Secret-Key': 'Xen0hJDC',
      },
      json: true,
    };

    const resultmsg = await this.httpPostRequest(
      'https://api-alimtalk.cloud.toast.com/alimtalk/v1.4/appkeys/cw04UrmLII6VPnxN/messages',
      body,
      options,
    );
    if (resultmsg.header.resultMessage.toUpperCase() !== 'SUCCESS') {
      throw new Error('ALIMTALK FAIL');
    }
    return true;
  }
}

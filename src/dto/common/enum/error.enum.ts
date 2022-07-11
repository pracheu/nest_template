export enum ErrorCode {
  // 중복 데이터
  DUPLICATE_KEY = 'DUPLICATE_KEY',

  // 존재하지 않거나 유효하지 않은 데이터
  NO_DATA = 'NO_DATA',

  // 클라이언트에서 요청을 잘못하였을 경우
  REQUEST_ERROR = 'REQUEST_ERROR',

  // 서버 에러
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',

  // 액세스토큰 만료
  ACCESS_TOKEN_EXPIRATION = 'ACCESS_TOKEN_EXPIRATION',

  // 리프레시토큰 만료
  REFRESH_TOKEN_EXPIRATION = 'REFRESH_TOKEN_EXPIRATION',
}

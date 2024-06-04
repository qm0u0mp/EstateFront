// 로그인 Request Body DTO
export interface SignInRequestDto {
    userId : string;
    userPassword : string;
}

// 아이디 중복확인 Request Body DTO
export interface IdCheckRequestDto {
    userId : string;
}

// 이메일 인증 Request Body DTO
export interface EmailAuthRequestDto {
    userEmail : string
}

// 이메일 이증 확인 Request Body DTO
export interface EmailAuthCheckRequestDto {
    userEmail : string;
    authNumber : string;
}

// 회원가입 Request Body DTO
export interface SignUpRequestDto {
    userId : string;
    userPassword : string;
    userEmail : string;
    authNumber : string;
}
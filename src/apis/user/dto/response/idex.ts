import ResponseDto from 'src/apis/response.dto';

// 로그인 유저 정보 불러오기 Response Body DTO 
export interface GetSignInUserResponseDto extends ResponseDto {
    userId: string;
    userRole: string;
}
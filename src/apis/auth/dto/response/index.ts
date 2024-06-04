import ResponseDto from "../../../response.dto";

// 로그인 Response Body DTO
export interface SignInResponseDto extends ResponseDto {
    accessToken : string;
    expires : number;
}
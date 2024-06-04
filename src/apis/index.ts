import { AxiosResponse } from "axios";
import ResponseDto from "./response.dto";

// Request 처리 함수
// 성공 결과를 받을 수 있음
// HTTP 실패 요청이 아닌 결과
export const requestHandler = <T>(response : AxiosResponse<T, any>) => {
    const responseBody = response.data;

    return responseBody;
}

// Request Error 처리 함수
// 실패 결과를 받을 수 있음
export const requestErrorHandler = (error : any) => { 
    const responseBody = error.response?.data;

    if(!responseBody){
        return null;
    }

    return responseBody as ResponseDto;
}

// Authorization Bearer 헤더
export const bearerAuthorization = (accessToken: string) => ({ headers: { 'Authorization' : `Bearer ${accessToken}` }})

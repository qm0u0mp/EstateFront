import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import './style.css'
import { useUserStore } from 'src/stores'
import { useCookies } from 'react-cookie';
import { deleteBoardRequest, getBoardRequest, increaseViewCountRequest, postCommentRequest } from 'src/apis/board';
import { useNavigate, useParams } from 'react-router';
import ResponseDto from 'src/apis/response.dto';
import { AUTH_ABSOLUTE_PATH, QNA_LIST_ABSOLUTE_PATH, QNA_UPDATE_ABSOLUTE_PATH } from 'src/constant';
import { GetBoardResponseDto } from 'src/apis/board/dto/response';
import { PostCommentRequestDto } from 'src/apis/board/dto/request';

export default function QnaDetail() {


    const {loginUserId, loginUserRole} = useUserStore();
    const {receptionNumber} = useParams();

    const [cookies] = useCookies();
    const [title, setTitle] = useState<string>('');
    const [writerId, setWriterId] = useState<string>('');
    const [writeDate, setWriteDate] = useState<string>('');
    const [viewCount, setViewCount] = useState<number>(0);
    const [contents, setContents] = useState<string>('');
    const[status, setStatus] = useState<boolean>(false);
    const[comment, setComment] = useState<string | null>(null);
    const [commentRows, setCommentRows] = useState<number>(1);

    const navigator = useNavigate();

    const increaseViewCountResponse = (result: ResponseDto | null) => {
        const message = 
            !result ? '서버에 문제가 있습니다.' : 
            result.code === 'VF' ? '잘못된 접수번호입니다.' :
            result.code === 'AF' ? '인증에 필해했습니다.' :
            result.code === 'NB' ? '존재하지 않는 접수번호입니다.' :
            result.code === 'DBE' ? '서버에 문제가 있습니다.' : '';

        if(!result || result.code !== 'SU'){
            alert(message);

            if(result?.code === 'AF'){
                navigator(AUTH_ABSOLUTE_PATH);
                return;
            }
            navigator(QNA_LIST_ABSOLUTE_PATH);
            return;
        }

        if(!cookies.accessToken || !receptionNumber) {
            return
        }
        getBoardRequest(receptionNumber, cookies.accessToken).then(getBoardResponse);
    };

    const getBoardResponse = (result: GetBoardResponseDto | ResponseDto | null) => {
        const message = 
            !result ? '서버에 문제가 있습니다.' : 
            result.code === 'VF' ? '잘못된 접수번호입니다.' :
            result.code === 'AF' ? '인증에 실패했습니다.' :
            result.code === 'NB' ? '존재하지 않는 접수번호입니다.' :
            result.code === 'DBE' ? '서버에 문제가 있습니다.' : '';

    if(!result || result.code !== 'SU'){
        alert(message);

        if(result?.code === 'AF'){
            navigator(AUTH_ABSOLUTE_PATH);
            return;
        }
        navigator(QNA_LIST_ABSOLUTE_PATH);
        return;
    }

    const { title, writerId, writeDatetime, viewCount, contents, status, comment } = result as GetBoardResponseDto;
    setTitle(title);
    setWriterId(writerId);
    setWriteDate(writeDatetime);
    setViewCount(viewCount);
    setContents(contents);
    setStatus(status);
    setComment(comment);
    
};

    const postCommentResponse = (result : ResponseDto | null) => {
        const message = 
            !result ? '서버에 문제가 있습니다.' : 
            result.code === 'AF' ? '권한이 없습니다.' :
            result.code === 'VF' ? '입력 데이터가 올바르지 않습니다.' :
            result.code === 'NB' ? '존재하지 않는 게시물입니다.' :
            result.code === 'WC' ? '이미 답글이 작성된 게시물입니다.':
            result.code === 'DBE' ? '서버에 문제가 있습니다.' : '';

        if(!result || result.code !== 'SU') {
            alert(message);
            return;
        }

        if(!receptionNumber || !cookies.accessToken){
            return;
        }

        getBoardRequest(receptionNumber, cookies.accessToken).then(getBoardResponse);
    }

    const deleteBoardResponse = (result: ResponseDto | null) => {
        const message = 
        !result ? '서버에 문제가 있습니다.' :
        result.code === 'AF' ? '권한이 없습니다.' :
        result.code === 'AF' ? '올바르지 않은 접수 번호입니다.' :
        result.code === 'NB' ? '존재하지 않는 접수 번호입니다.' :
        result.code === 'DBE' ? '서버에 문제가 있습니다.' : '';

        if(!result || result.code !== 'SU') {
            alert(message);
            return;
        }

        navigator(QNA_LIST_ABSOLUTE_PATH);
    }

    // 답글 텍스트 핸들러
    const onCommentChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
        if(status || loginUserRole !== 'ROLE_ADMIN') {
            return;
        }

        const comment = event.target.value;
        setComment(comment);

        // split
        // - 문자열 기준으로 문자를 잘라서 배열로 만들어주는 것
        // - 개행 문자를 기준으로 잘라서 배열로 만듦
        const commentRows = comment.split('\n').length;
        setCommentRows(commentRows);
    }

    // 답글달기 버튼 클릭 핸들러
    const onCommentSubmitClickHandler = () => {
        if (!comment || !comment.trim()) {
            return;
        }

        if (!receptionNumber || loginUserRole !== 'ROLE_ADMIN' || !cookies.accessToken) {
            return;
        }
        
        const requestBody: PostCommentRequestDto = { comment };
        
        postCommentRequest(receptionNumber, requestBody, cookies.accessToken).then(postCommentResponse);
    };

    // 목록 버튼 핸들러
    const onListClickHandler = () => {
        navigator(QNA_LIST_ABSOLUTE_PATH);
    };

    // 수정 버튼 핸들러
    const onUpdateClickHandler = () => {
        if(!receptionNumber || loginUserId !== writerId || status) {
            return;
        }

        navigator(QNA_UPDATE_ABSOLUTE_PATH(receptionNumber));
    }

    // 삭제버튼 핸들러
    const onDeleteClickHandler = () => {
        if(!receptionNumber || loginUserId !== writerId || !cookies.accessToken){
            return;
        }

        const isConfirm = window.confirm('정말 삭제하시겠습니까?');

        if(!isConfirm){
            return;
        }
        
        deleteBoardRequest(receptionNumber, cookies.accessToken).then(deleteBoardResponse);
    }
    
    useEffect(() => {
        if (!cookies.accessToken || !receptionNumber) return;
        increaseViewCountRequest(receptionNumber, cookies.accessToken)
            .then(increaseViewCountResponse);
    }, []);

    const coveredWriterId = writerId !== '' && (writerId[0] + '*'.repeat(writerId.length-1));
    return (
        <div id='qna-detail-wrapper'>
            <div className='qna-detail-main-box'>
                <div className='qna-detail-top-box'>
                    <div className='qna-detail-title-box'>{title}</div>
                    <div className='qna-detail-info-box'>
                        <div className='qna-detail-info'>작성자 {coveredWriterId}</div>
                        <div className='qna-detail-info-divider'>{'\|'}</div>
                        <div className='qna-detail-info'>작성일 {writeDate}</div>
                        <div className='qna-detail-info-divider'>{'\|'}</div>
                        <div className='qna-detail-info'>조회수 1 {viewCount}</div>
                    </div>
                </div>
                <div className='qna-detail-contents-box'>{contents}</div>
            </div>

            {loginUserRole === 'ROLE_ADMIN' && !status &&
                <div className='qna-detail-comment-write-box'>
                    <div className='qna-detail-comment-textarea-box'>
                        <textarea 
                            className='qna-detail-comment-textarea' 
                            style={{height: `${28 * commentRows}px`}} 
                            value={comment == null ? '' : comment}
                            onChange={onCommentChangeHandler}
                            placeholder='답글을 작성해주세요.'>
                        </textarea>
                    </div>
                    <div 
                    className='primary-button'
                    onClick={onCommentSubmitClickHandler}
                    >
                    답글달기
                    </div>                
                </div>
            }
            
            {status &&
                <div className='qna-detail-comment-box'>
                    <div className='primary-bedge'>답변</div>
                        <div className='qna-detail-comment'>{comment}</div>
                    </div>
            }
                <div className='qna-detail-button-box'>
                    <div className='primary-button' onClick={onListClickHandler}>목록 보기</div>
                    {loginUserId === writerId && loginUserRole === 'ROLE_USER' &&               
                        <div className='qna-detail-owner-button-box'>
                            {!status && <div className='second-button' onClick={onUpdateClickHandler}>수정</div>}
                            <div className='error-button' onClick={onDeleteClickHandler}>삭제</div>
                        </div>
                    }                
            </div>
        </div>
    )
}

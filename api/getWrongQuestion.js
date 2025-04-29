import {request} from "./request"
import {getUserId} from './getUserId'

// 获取错题本的题目
export const getWrongQuestion = () => {
    const userId = getUserId()
    return request({
        // url: `/dailyQuestion/getEverydayQuestion/${data}`,
        url:`/wrongQuestion/getWrongQuestion?userId=${userId}`,
        method: 'GET'
    })
}

// 专属与错题本的 判断
export const apiJudgeWrongQuestion = (data) => {
    const userId = getUserId();
    return request({
        url: `/dailyQuestion/judgeQuestion?userId=${userId}`,
        method: 'POST',
        data
    });
};



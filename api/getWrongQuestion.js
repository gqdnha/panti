import {request} from "./request"
import {getUserId} from './getUserId'

// 管理端
export const getOneWrongQuestion = (data) => {
    console.log(data);
    const userId = data.userId
    const type = data.type
    console.log(userId);
    return request({
        // url: `/dailyQuestion/getEverydayQuestion/${data}`,
        url:`/wrongQuestion/getWrongQuestion?userId=${userId}&type=${type}`,
        method: 'GET'
    })
}

// 获取错题本的题目
export const getWrongQuestion = (data) => {
    const userId = getUserId()
    const type = data
    console.log(type);
    return request({
        // url: `/dailyQuestion/getEverydayQuestion/${data}`,
        url:`/wrongQuestion/getWrongQuestion?userId=${userId}&type=${type}`,
        method: 'GET'
    })
}

// 专属与错题本的 判断
export const apiJudgeWrongQuestion = (data) => {
    const userId = getUserId();
    return request({
        url: `/wrongQuestion/judgeWrongQuestion?userId=${userId}`,
        method: 'POST',
        data
    });
};



import { request } from "./request";
import {getUserId} from './getUserId'
// 假设 getUserId 是一个获取 userId 的函数


export const apiJudgeTest = (data) => {
    const userId = getUserId();
    return request({
        // url: `/dailyQuestion/judgeQuestion?userId=${userId}`,
        url: `/dailyQuestion/judgeQuestion?userId=${userId}`,
        method: 'POST',
        data
    });
};

export const apiDailyJudgeTest = (data) => {
    const userId = getUserId();
    return request({
        url: `/dailyQuestion/judgeDailyQuestion?userId=${userId}`,
        method: 'POST',
        data
    });
};
    
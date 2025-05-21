import { request } from "./request";
import {getUserId} from './getUserId'
// 假设 getUserId 是一个获取 userId 的函数


export const getDailyTestAnswer = (data) => {
    const userId = getUserId();
    console.log('userId',userId);
    return request({
        url: `/dailyQuestion/getDailyQuestionAnswer?userId=${userId}`,
        method: 'GET',
        data
    });
};
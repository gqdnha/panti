import {
    request
} from "./request";
import {getUserId} from './getUserId'

// 获取当前用户的每日练习完成情况
export const getDailyFinesh = () => {
    const userId =getUserId()
    return request({
        url: `/dailyQuestion/getDailyQuestionFinish?userId=${userId}`,
        method: 'GET',
    });
};

// 获取指定用户的每日练习完成情况
export const getUserDailyFinish = (userId) => {
    return request({
        url: `/dailyQuestion/getDailyQuestionFinish?userId=${userId}`,
        method: 'GET',
    });
};
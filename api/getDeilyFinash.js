import {
    request
} from "./request";
import {getUserId} from './getUserId'

export const getDailyFinesh = () => {
    const userId =getUserId()
    return request({
        url: `/dailyQuestion/getDailyQuestionFinish?userId=${userId}`,
        method: 'GET',
    });
};
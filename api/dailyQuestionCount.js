import {request} from "./request";
import {getUserId} from './getUserId'

export const dailyQuestionCount = (data) => {
    const userId = getUserId()
    const DailyQuestionCount = data
    console.log(DailyQuestionCount);
    return request({
        url: `/dailyQuestion/addDailyQuestionFinish?DailyQuestionCount=${DailyQuestionCount}&userId=${userId}`,
        method: 'POST',
    });
};
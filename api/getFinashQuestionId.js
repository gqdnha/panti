import {request} from "./request";
import {getUserId} from './getUserId'

export const getFinashQuestionId = (data) => {
    console.log("123",data);
    const userId =getUserId()
    const type = data.type
    const category = data.category
    console.log(userId);
    return request({
        url: `/question/getAlreadyCategoryAndTypeQuestion?userId=${userId}&type=${type}&category=${category}`,
        method: 'GET',
    });
};
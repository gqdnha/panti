// 获取错题数量
import { request } from "./request";
import {getUserId} from './getUserId'
export const getWrongCount = () => {
    const userId = getUserId()
    // console.log(data);
    return request({
        url: `/wrongQuestion/getWrongQuestionCount?userId=${userId}`,
        method: 'GET',
    });
};


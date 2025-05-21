import { request } from "./request";
import {getUserId} from './getUserId'

// 管理端
export const getAllCount = () => {
    const userId = getUserId()
    console.log(userId);
    return request({
        url:`/question/getCountQuestion?userId=${userId}`,
        method: 'GET'
    })
}
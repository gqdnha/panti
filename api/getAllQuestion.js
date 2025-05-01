import { request } from "./request";
// import {getUserId} from './getUserId'
// 假设 getUserId 是一个获取 userId 的函数


export const getAllQuestion = (data) => {
    // const userId = getUserId();
    return request({
        url: `/question/findNewsPage`,
        method: 'POST',
        data
    });
};

    
import { request } from "./request";

// 获取题目列表
export const getAllQuestion = (data) => {
    return request({
        url: `/question/findNewsPage`,
        method: 'POST',
        data
    });
};

    
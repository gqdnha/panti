import { request } from "./request";
//禁用题目
// import { request } from "./request";

// 禁用题目
export const deleteQuestion = (questionId) => {
    console.log(questionId);
    console.log(typeof questionId);
    return request({
        url: `/mange/deleteQuestion`,
        method: 'DELETE',
        Header: {
            'Content-Type': 'application/json', 
            questionId: questionId.toString()
        },
    });
};

//获取用户数据
export const getAllUserInfo = (data) => {
    console.log(data);
    return request({
        url: `/mange/findUserPage`,
        method: 'POST',
        data
    });
};

// 获取题目列表
export const getAllQuestion = (data) => {
    return request({
        url: `/question/findNewsPage`,
        method: 'POST',
        data
    });
};
// 新建题目
export const addNewQuestion = (data) => {
    return request({
        url: `/mange/newQuestion`,
        method: 'POST',
        data
    });
};

    
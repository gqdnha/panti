import { request } from "./request";

// 查看题目详情
export const getQuestionDetail = (questionId) => {
    return request({
        url: `/question/findQuestionDetail/${questionId}`,
        method: 'GET',
        header: {
            'Content-Type': 'application/json'
        }
    });
};

// 编辑题目
export const updateQuestion = (header, data) => {
    return request({
        url: `/admin/question/update`,
        method: 'POST',
        header: {
           ...header,
            'Content-Type': 'application/json'
        },
        data
    });
};

// 禁用题目
export const deleteQuestion = (questionId) => {
    console.log(questionId);
    console.log(typeof questionId);
    return request({
        url: `/mange/deleteQuestion`,
        method: 'DELETE',
        header: {
            'Content-Type': 'application/json', 
            questionId: questionId.toString()
        }
    });
};

// 获取用户数据
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
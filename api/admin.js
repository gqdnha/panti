import {
    request
} from "./request";

// 添加法律条文
export const addLawsApi = (regulationName,data) => {
    console.log(regulationName,data);
    // console.log(questionId);
    return request({
        url: `/mange/updateQuestion?regulationName=${regulationName}`,
        method: 'POST',
        data
    });
};

// 获取一个题的错误率
export const getWrongQuestionPercent = (questionId) => {
        // console.log(questionId);
    return request({
        url: `/wrongQuestion/getWrongQuestionPercent?questionId=${questionId}`,
        method: 'GET',
    });
};


// 查看题目详情
export const getQuestionDetail = (questionId) => {
    return request({
        url: `/question/findQuestionDetail/${questionId}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

// 编辑题目
export const updateQuestion = (questionId,data) => {
    console.log(questionId);
    return request({
        url: `/mange/updateQuestion?questionId=${questionId}`,
        method: 'POST',
        data
    });
};


// 禁用题目
export const deleteQuestionApi = (questionId) => {
    console.log(questionId);
    return request({
        url: `/mange/deleteQuestion?questionId=${questionId}`,
        method: 'POST',
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
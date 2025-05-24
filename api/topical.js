import {request} from "./request";
import {getUserId} from './getUserId'

// 判题
export const judgeTopicalTest = (data) => {
    const userId = getUserId();
    return request({
        url: `/userCategoryAnswer/judgeCategoryQuestion?userId=${userId}`,
        method: 'POST',
        data
    });
};
// 获取答题记录
export const getFinashAnswer= (data) => {
    console.log("123",data);
    const userId =getUserId()
    const type = data.type
    const category = data.category
    console.log(userId);
    return request({
        url: `/userCategoryAnswer/getCategoryQuestionAnswer?userId=${userId}&type=${type}&category=${category}`,
        method: 'GET',
    });
};
// 删除答题记录
export const deleteAnswerHistory = (data) => {
    const userId = getUserId()
    const category = data.category
    const type = data.type
    return request({
        url: `/userCategoryAnswer/deleteCategoryQuestionAnswer?userId=${userId}&category=${category}&type=${type}`,
        method: 'GET',
    });
};
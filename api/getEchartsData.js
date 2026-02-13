import {
    request
} from "./request";
// import {getUserId} from './getUserId'

// 获取学习时长报表
export const getLearnTimeReport = (region) => {
    return request({
        url: `/report/getLearnTimeReport?region=${region}`,
        method: 'GET',
    });
};

// 获取用户完成每日答题情况报表
export const getUserDailyFinishReport = (region) => {
    return request({
        url: `/report/getUserDailyFinishReport?region=${region}`,
        method: 'GET',
    });
};

// 获取部门人数
export const getUserReport = (region) => {
    return request({
        url: `/report/getUserReport?region=${region || ''}`,
        method: 'GET',
    });
};

// 获取部门正确率
export const getUserRightReport = (region) => {
    return request({
        url: `/report/getUserRightReport?region=${region}`,
        method: 'GET',
    });
};
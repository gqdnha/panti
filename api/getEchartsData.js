import {
    request
} from "./request";
import {getUserId} from './getUserId'

// 获取学习时长报表
export const getLearnTimeReport = () => {
    return request({
        url: `/report/getLearnTimeReport`,
        method: 'GET',
    });
};

// 获取用户完成每日答题情况报表
export const getUserDailyFinishReport = (userId) => {
    return request({
        url: `/report/getUserDailyFinishReport`,
        method: 'GET',
    });
};

// 获取部门人数
export const getUserReport = (userId) => {
    return request({
        url: `/report/getUserReport`,
        method: 'GET',
    });
};

// 获取部门正确率
export const getUserRightReport = (userId) => {
    return request({
        url: `/report/getUserRightReport`,
        method: 'GET',
    });
};
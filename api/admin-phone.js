import {request} from "./request";
// import {getUserId} from './getUserId'
import {getUserId} from './NogetUserId'

// 获取手机号
export const getphoneApi = (data) => {
    const userId = getUserId()
    const phone = data
    return request({
        url: `/mange/getPhone?userId=${userId}&phone=${phone}`,
        method: 'GET',
    });
};

// 添加手机号
export const addPhone = (data) => {
    const userId = getUserId()
    const phoneNumber = data
    return request({
        url: `/mange/addPhone?userId=${userId}&phoneNumber=${phoneNumber}`,
        method: 'POST',
    });
};

export const deletePhone = (data) => {
    const userId = getUserId()
    const phoneId = data
    return request({
        url: `/mange/deletePhone?userId=${userId}&phoneId=${phoneId}`,
        method: 'POST',
    });
};
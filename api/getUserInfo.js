import {request} from "./request"
import {getUserId} from './getUserId'

// 获取正确率等信息
export const getUserInfo = () => {
    const userId = getUserId()
    console.log(userId,'获取用户id用于正确率获取');
    return request({
        // url: `/dailyQuestion/getEverydayQuestion/${data}`,
        url:`/question/findAlreadyQuestion?userId=${userId}`,
        method: 'POST'
    })
}

// 获取错题本的题目
export const getWrongQuestion = () => {
    const userId = getUserId()
    return request({
        // url: `/dailyQuestion/getEverydayQuestion/${data}`,
        url:`/wrongQuestion/getWrongQuestion?userId=${userId}`,
        method: 'GET'
    })
}

// 禁用用户
export const unUseUser = (data) => {
    console.log(data);
    const userList =data
    console.log(userList);
    return request({
        // url: `/dailyQuestion/getEverydayQuestion/${data}`,
        url:`/mange/disableUser?userList=${userList}`,
        method: 'GET'
    })
}
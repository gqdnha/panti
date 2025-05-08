import {request} from "./request";
import {getUserId} from './getUserId'

// 登录以及修改手机号

export const judgeCode = (data) => {
    console.log(data);
    const phoneNumber = data.phone
    const code = data.code
    const userId =getUserId()
    console.log(code);
    console.log(phoneNumber);
    console.log(userId);
    return request({
        url: `/user/judgeCode?userId=${userId}&code=${code}&phoneNumber=${phoneNumber}`,
        method: 'POST',
    });
};

// 获取验证码
export const sendCode = (data) => {
    const phoneNumber =data
    console.log(phoneNumber);
    return request({
        // url: `/dailyQuestion/getEverydayQuestion/${data}`,
        url:`/user/sendCode?phoneNumber=${phoneNumber}`,
        method: 'GET'
    })
}

// 微信登录
export const wxLogin = (code) => {
    console.log(code);
    return request({
        url: `/user/login`,
        method: 'POST',
        data: { code }
    });
};

export const changeUserName = (data) => {
    const userId = getUserId()
    const name = data
    return request({
        url: `/user/updateName?name=${name}&userId=${userId}`,
        method: 'POST',
    });
};
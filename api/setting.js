import {request} from "./request";
import {getUserId} from './getUserId'

// 修改用户名
export const changeUserName = (data) => {
    const userId = getUserId()
    const name = data
    return request({
        url: `/user/updateName?name=${name}&userId=${userId}`,
        method: 'POST',
    });
};

// 修改手机号
export const changePhone = (data) => {
    const userId = getUserId()
    const phoneNumber = phoneNumber
    const code = code
    return request({
        url: `/user/updateName?phoneNumber=${phoneNumber}&userId=${userId}&code=${code}`,
        method: 'POST',
    });
};


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
export const chengePhone = (data) => {
    const userId = getUserId()
    const phone = data
    console.log(data);
    console.log(userId,phone);
    // const code = code
    return request({
        url: `/user/updatePhone?phone=${phone}&userId=${userId}`,
        method: 'POST',
    });
};


import { request } from "./request";

export const getAllUserInfo = (data) => {
    console.log(data);
    return request({
        url: `/mange/findUserPage`,
        method: 'GET',
        data
    });
};


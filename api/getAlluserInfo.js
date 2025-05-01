import { request } from "./request";

export const getAllUserInfo = (body) => {
    console.log(body);
    return request({
        url: `/mange/findUserPage`,
        method: 'GET',
        body
    });
};


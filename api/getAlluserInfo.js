import { request } from "./request";

export const getAllUserInfo = (userName) => {
    return request({
        url: `/mange/findUserPage`,
        method: 'GET',
        userName
    });
};
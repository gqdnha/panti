import { request } from "./request";

export const getAllUserInfo = (data) => {
    console.log(data);
    return request({
        url: `/user/addLearnTime`,
        method: 'POST',
        data
    });
};


import {
    request
} from "./request";
export const get20Mistake = () => {
    return request({
        url: `/question/get50HighWrongQuestion`,
        method: 'GET',
    });
};
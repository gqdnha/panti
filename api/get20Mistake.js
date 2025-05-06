import {
    request
} from "./request";
export const get20Mistake = () => {
    return request({
        url: `/question/get20HighWrongQuestion`,
        method: 'GET',
    });
};
import { request } from "./request";
import {getUserId} from './getUserId'
export const addLearnTime = (time) => {
    const userId = getUserId()
    // console.log(data);
    return request({
        url: `/user/addLearnTime?userId=${userId}&time=${time}`,
        method: 'POST',
    });
};


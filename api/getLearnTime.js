

import { request } from "./request";
import {getUserId} from './getUserId'
export const getLearnTime = (time) => {
    console.log(time);
    const userId = getUserId()
    // console.log(data);
    return request({
        url: `/user/getLearnTime?userId=${userId}`,
        method: 'GET',
    });
};
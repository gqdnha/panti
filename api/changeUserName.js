import {request} from "./request";
import {getUserId} from './getUserId'

export const changeUserName = (data) => {
    const userId = getUserId()
    const name = data
    return request({
        url: `/user/updateName?name=${name}&userId=${userId}`,
        method: 'POST',
    });
};


import {request} from "./request";


export const getLawsData = (data) => {
    console.log(data);
    return request({
        url:`/regulation/getRegulation`,
        method: 'POST',
        data
    })
}
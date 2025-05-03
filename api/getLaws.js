import {request} from "./request";


export const getWrongQuestion = () => {
    const userId = getUserId()
    return request({
        // url: `/dailyQuestion/getEverydayQuestion/${data}`,
        url:`/wrongQuestion/getWrongQuestion?userId=${userId}`,
        method: 'GET'
    })
}
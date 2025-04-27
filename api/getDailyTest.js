import {request} from "./request"
// 获取每日练习20题
export const apiGetDailyTest = () => {
    return request({
        // url: `/dailyQuestion/getEverydayQuestion/${data}`,
        url:`/dailyQuestion/getEverydayQuestion`,
        method: 'GET'
    })
}

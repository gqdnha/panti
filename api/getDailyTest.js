import {request} from "./request"
import {getUserId} from './getUserId'
// 获取每日练习20题
export const apiGetDailyTest = () => {
    const userId = getUserId()
    return request({
        // url: `/dailyQuestion/getEverydayQuestion/${data}`,
        url:`/dailyQuestion/getEverydayQuestion?userId=${userId}`,
        method: 'GET'
    })
}

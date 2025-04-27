import {request} from "./request"
// 判断题目
export const apiJudgeTest = (data) => {
    // const token = wx.getStorageSync('token');
    return request({
        url: `/dailyQuestion/judgeQuestion`,
        method: 'POST',
        data,
        params:{userId:'1'}
    })
}

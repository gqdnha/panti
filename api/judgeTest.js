import {request} from "./request"

// 判断题目
export const apiJudgeTest = (data) => {
    return request({
        url: `/dailyQuestion/judgeQuestion`,
        method: 'POST',
        data
    })
}
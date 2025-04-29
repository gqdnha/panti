import { request } from "./request";

// 假设 getUserId 是一个获取 userId 的函数
// 实际使用时，你可以根据业务场景替换获取 userId 的逻辑
const getUserId = () => {
    // 这里简单返回一个示例 userId，实际中可能从缓存、登录信息等获取
    return 123; 
};

export const apiJudgeTest = (data) => {
    const userId = getUserId();
    return request({
        url: `/dailyQuestion/judgeQuestion?userId=${userId}`,
        method: 'POST',
        data
    });
};
    
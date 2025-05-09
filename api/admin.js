import {request} from "./request";
import {getUserId} from './getUserId'
import { baseURL } from "./request";
// 删除法律 
export const deleteLawApi = (regulationId) => {
    const userId = getUserId()

    console.log(regulationId);
    console.log(userId);
    return request({
        url: `/mange/deleteRegulation?regulationId=${regulationId}&userId=${userId}`,
        method: 'POST',
    });
};
// 删除图片 
export const deletePicApi = (data) => {
    // const userId = getUserId()
    const pid = data
    console.log(pid);
    // console.log(userId);
    return request({
        url: `/image/deletePicture?pid=${pid}`,
        method: 'POST',
    });
};
// 禁用题目
export const deleteQuestionApi = (questionId) => {
    const userId =getUserId()
    console.log(questionId);
    return request({
        url: `/mange/deleteQuestion?questionId=${questionId}&userId=${userId}`,
        method: 'POST',
    });
};

// 添加法律条文
export const addLawsApi = (regulationType, data) => {
    console.log('开始上传文件，参数：', {
        regulationType,
        regulationName: data.regulationName,
        filePath: data.file
    });

    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: `${baseURL}/regulation/addRegulation`,
            filePath: data.file,
            name: 'files',  // 文件参数名必须是files
            formData: {
                regulationName: data.regulationName,
                regulationType: regulationType,
                userId: 1
            },
            header: {
                'content-type': 'multipart/form-data'
            },
            success: (res) => {
                console.log('上传响应：', res);
                try {
                    const response = JSON.parse(res.data);
                    if (response.code === 200) {
                        resolve(response.data);
                    } else {
                        console.error('上传失败，服务器响应：', response);
                        reject(response.message || '添加失败');
                    }
                } catch (error) {
                    console.error('解析响应失败：', error, '原始响应：', res.data);
                    reject('解析响应失败');
                }
            },
            fail: (error) => {
                console.error('上传请求失败：', error);
                if (error.errMsg.includes('domain list')) {
                    reject('请在小程序管理后台配置服务器域名');
                } else {
                    reject(error.errMsg || '上传失败');
                }
            }
        });
    });
};
// 新建题目
export const addNewQuestion = (data) => {
    const userId =getUserId()
    return request({
        url: `/mange/newQuestion?userId=${userId}`,
        method: 'POST',
        data
    });
};

// 上传图片的接口
export const uploadImageApi = (questionId, filePath) => {
    console.log('开始上传图片，参数：', {
        questionId,
        filePath
    });

    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: `${baseURL}/image/addPicture`,
            filePath: filePath,
            name: 'files',  // 文件参数名必须是files
            formData: {
                questionId: questionId
            },
            header: {
                'content-type': 'multipart/form-data'
            },
            success: (res) => {
                console.log('上传响应：', res);
                try {
                    const response = JSON.parse(res.data);
                    if (response.code === 200) {
                        resolve(response.data);
                    } else {
                        console.error('上传失败，服务器响应：', response);
                        reject(response.message || '上传图片失败');
                    }
                } catch (error) {
                    console.error('解析响应失败：', error, '原始响应：', res.data);
                    reject('解析响应失败');
                }
            },
            fail: (error) => {
                console.error('上传请求失败：', error);
                if (error.errMsg.includes('domain list')) {
                    reject('请在小程序管理后台配置服务器域名');
                } else {
                    reject(error.errMsg || '上传失败');
                }
            }
        });
    });
};

// 获取一个题的错误率
export const getWrongQuestionPercent = (questionId) => {
    
    return request({
        url: `/wrongQuestion/getWrongQuestionPercent?questionId=${questionId}`,
        method: 'GET',
    });
};


// 查看题目详情
export const getQuestionDetail = (questionId) => {
    return request({
        url: `/question/findQuestionDetail/${questionId}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

// 编辑题目
export const updateQuestion = (questionId,data) => {
    const userId = getUserId()
    console.log(questionId);
    return request({
        url: `/mange/updateQuestion?questionId=${questionId}&userId=${userId}`,
        method: 'POST',
        data
    });
};

// 获取用户数据
export const getAllUserInfo = (data) => {
    // console.log(data);
    return request({
        url: `/mange/findUserPage`,
        method: 'POST',
        data
    });
};

// 获取今日用户及完成率
export const getUserToday = () => {
    return request({
        url: `/dailyQuestion/getDailyQuestionStatus`,
        method: 'GET'
    });
};

// 获取题目列表
export const getAllQuestion = (data) => {
    console.log(data);
    return request({
        url: `/question/findNewsPage`,
        method: 'POST',
        data
    });
};


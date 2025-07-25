export const baseURL = "https://gqdnha.cn:8090";

// 处理登录状态失效的逻辑
const handleUnauthorized = () => {
    wx.hideLoading();
    const pages = getCurrentPages();
    let currPage = null;
    if (pages.length) {
        currPage = pages[pages.length - 1];
    }
    const route = currPage? currPage.route : null;
    console.log('handleUnauthorized: 登录状态失效，当前页面路由:', route);
    return "登录状态失效，请重新登录";
};

// 处理请求成功但业务逻辑错误的情况
const handleBusinessError = (res) => {
    console.log('handleBusinessError: 业务逻辑错误，响应数据:', res);
    /* wx.showToast({
        title: res.data.message,
        icon: "none"
    }); */
    return res.data.message;
};

// 响应拦截器
const responseInterceptor = (response) => {
    // 统一处理响应数据格式
    if (response.data && typeof response.data === 'string') {
        try {
            response.data = JSON.parse(response.data);
        } catch (e) {
            console.error('响应数据解析错误:', e);
        }
    }
    
    // 处理业务状态码
    if (response.data.code !== 200) {
        /* wx.showToast({
            title: response.data.message || '请求失败',
            icon: 'none'
        }); */
    }
    
    return response;
};

// 存储所有请求的 task
const requestTasks = new Map();

/**
 * 统一封装的请求
 * @param option为参数对象，至少包含url、method
 */
export const request = function request(option) {
    let token = `Bearer ${wx.getStorageSync("gs-token")}`;
    return new Promise((resolve, reject) => {
        let header = {
            "Content-Type": "application/json", // 修改为正确的大小写
            Authorization: token
        };
        
        const maxRetries = 3;
        let retryCount = 0;
        
        const makeRequest = () => {
            const task = wx.request({
                url: baseURL + option.url,
                method: option.method,
                // 根据后端接口要求，灵活处理 data
                data: option.data || "", 
                header: header,
                // 根据后端接口要求，灵活处理 params
                params: option.params || "", 
                timeout: 5000,
                success(res) {
                    console.log('请求成功，完整响应:', res);
                    res = responseInterceptor(res);
                    if (res.data.code === 200) {
                        resolve(res.data.data);
                    } else if (res.statusCode === 401) {
                        reject(handleUnauthorized());
                    } else if (res.statusCode === 400) {
                        console.log('request success: 400 Bad Request, 详细信息:', res.data);
                        /* wx.showToast({
                            title: res.data.error || "请求参数错误",
                            icon: "none"
                        }); */
                        reject(res.data.error || "请求参数错误");
                    } else {
                        reject(handleBusinessError(res));
                    }
                },
                fail(err) {
                    console.log('请求失败，错误详情:', err);
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`请求失败，正在进行第 ${retryCount} 次重试...`);
                        setTimeout(makeRequest, 1000 * retryCount);
                    } else {
                        wx.showToast({
                            title: "网络请求失败，请检查网络连接",
                            icon: "none"
                        });
                        reject(err);
                    }
                }
            });
            
            // 存储请求 task
            requestTasks.set(option.url, task);
            
            // 请求完成后移除 task
            task.complete = () => {
                requestTasks.delete(option.url);
            };
        };
        
        makeRequest();
    });
};

// 取消指定请求
export const cancelRequest = (url) => {
    const task = requestTasks.get(url);
    if (task) {
        task.abort();
        requestTasks.delete(url);
    }
};

// 取消所有请求
export const cancelAllRequests = () => {
    requestTasks.forEach((task) => {
        task.abort();
    });
    requestTasks.clear();
};
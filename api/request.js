export const baseURL = "https://gqdnha.cn:8090";

// 处理登录状态失效的逻辑
const handleUnauthorized = () => {
    wx.hideLoading();
    const pages = getCurrentPages();
    let currPage = null;
    if (pages.length) {
        currPage = pages[pages.length - 1];
    }
    const route = currPage ? currPage.route : null;
    console.log('handleUnauthorized: 登录状态失效，当前页面路由:', route);
    return "登录状态失效，请重新登录";
};

// 处理请求成功但业务逻辑错误的情况
const handleBusinessError = (res) => {
    console.log('handleBusinessError: 业务逻辑错误，响应数据:', res);
    return res.data?.message || '请求失败';
};

// 响应拦截器（仅处理文本类型响应）
const responseInterceptor = (response) => {
    // 统一处理响应数据格式（仅对字符串类型数据解析JSON）
    if (response.data && typeof response.data === 'string') {
        try {
            response.data = JSON.parse(response.data);
        } catch (e) {
            console.error('响应数据解析错误（非JSON格式）:', e);
        }
    }
    
    // 处理业务状态码
    if (response.data?.code !== 200) {
        console.log('业务状态码错误:', response.data?.code, response.data?.message);
    }
    
    return response;
};

// 存储所有请求的 task
const requestTasks = new Map();

/**
 * 统一封装的请求
 * @param option 参数对象，至少包含url、method
 * @param responseType 响应类型（默认text，文件下载用arraybuffer）
 */
export const request = function request(option, responseType = 'text') {
    let token = `Bearer ${wx.getStorageSync("gs-token")}`;
    return new Promise((resolve, reject) => {
        const header = {
            "Content-Type": "application/json",
            Authorization: token
        };
        
        const maxRetries = 3;
        let retryCount = 0;
        
        const makeRequest = () => {
            const task = wx.request({
                url: baseURL + option.url,
                method: option.method || 'GET',
                data: option.data || "",
                header: header,
                params: option.params || "",
                timeout: 10000, // 延长超时时间（文件下载可能较慢）
                responseType: responseType, // 关键：指定响应类型
                success(res) {
                    console.log(`[${option.method}]请求成功，URL:${option.url}，完整响应:`, res);
                    
                    // 仅文本类型响应需要经过拦截器解析
                    if (responseType === 'text') {
                        res = responseInterceptor(res);
                    }
                    
                    // 状态码处理
                    if (res.statusCode === 200) {
                        // 关键修改：返回完整响应体（包含code、message、data）
                        resolve(responseType === 'text' ? res.data : res.data);
                    } else if (res.statusCode === 401) {
                        reject(handleUnauthorized());
                    } else if (res.statusCode === 400) {
                        reject(res.data?.error || "请求参数错误");
                    } else {
                        reject(handleBusinessError(res));
                    }
                },
                fail(err) {
                    console.log(`[${option.method}]请求失败，URL:${option.url}，错误详情:`, err);
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.log(`正在进行第${retryCount}次重试...`);
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
            
            requestTasks.set(option.url, task);
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
    requestTasks.forEach(task => task.abort());
    requestTasks.clear();
};
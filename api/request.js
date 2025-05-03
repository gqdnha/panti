export const baseURL = "http://gqdnha.cn:8090";
// export const baseURL = "http://172.20.10.3:8090";

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
    wx.showToast({
        title: res.data.message,
        icon: "none"
    });
    return res.data.message;
};

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
        wx.request({
            url: baseURL + option.url,
            method: option.method,
            // 根据后端接口要求，灵活处理 data
            data: option.data || "", 
            header: header,
            // 根据后端接口要求，灵活处理 params
            params: option.params || "", 
            timeout: 5000,
            success(res) {
                console.log('request success: 响应数据:', res);
                if (res.data.code === 200) {
                    resolve(res.data.data);
                } else if (res.statusCode === 401) {
                    reject(handleUnauthorized());
                } else if (res.statusCode === 400) {
                    // 进一步分析 400 错误的原因
                    console.log('request success: 400 Bad Request, 详细信息:', res.data);
                    wx.showToast({
                        title: res.data.error || "请求参数错误",
                        icon: "none"
                    });
                    reject(res.data.error || "请求参数错误");
                } else {
                    reject(handleBusinessError(res));
                }
            },
            fail(err) {
                console.log('request fail: 错误信息:', err);
                reject(err);
            }
        });
    });
};
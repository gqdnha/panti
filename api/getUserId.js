// 从缓存中获取userId
export const getUserId = () => {
    try {
        const userId = wx.getStorageSync('userId');
        if (!userId) {
            console.error('未找到userId，请先登录');
            return null;
        }
        return userId;
    } catch (error) {
        console.error('获取userId失败:', error);
        return null;
    }
};
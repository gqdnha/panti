// 根据用户角色设置tabBar
export const setupTabBar = () => {
    const role = wx.getStorageSync('role');
    
    // 如果是普通用户，隐藏管理tab
    if (role === 'user') {
        // 隐藏管理tab
        wx.hideTabBar({
            animation: false
        });
    } else {
        // 如果是管理员，显示所有tab
        wx.showTabBar({
            animation: false
        });
    }
}; 
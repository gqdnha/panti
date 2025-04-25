// pages/user-info/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: null,
        studyStats: {
            totalQuestions: 0,
            correctRate: 0,
            totalTime: 0
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getUserInfo();
        this.getStudyStats();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // 每次显示页面时更新数据
        this.getUserInfo();
        this.getStudyStats();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    getUserInfo() {
        const userInfo = wx.getStorageSync('userInfo');
        this.setData({
            userInfo
        });
    },

    getStudyStats() {
        // TODO: 从服务器获取学习统计数据
        // 这里使用模拟数据
        this.setData({
            studyStats: {
                totalQuestions: 100,
                correctRate: 85,
                totalTime: 120
            }
        });
    },

    navigateToHistory() {
        if (!this.data.userInfo) {
            this.showLoginTip();
            return;
        }
        wx.navigateTo({
            url: '/pages/history/index'
        });
    },


    navigateToSettings() {
        if (!this.data.userInfo) {
            this.showLoginTip();
            return;
        }
        wx.navigateTo({
            url: '/pages/settings/index'
        });
    },

    showLoginTip() {
        wx.showModal({
            title: '提示',
            content: '请先登录',
            confirmText: '去登录',
            success: (res) => {
                if (res.confirm) {
                    wx.navigateTo({
                        url: '/pages/login/index'
                    });
                }
            }
        });
    },

    handleLogout() {
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    // 清除用户信息
                    wx.removeStorageSync('userInfo');
                    this.setData({
                        userInfo: null
                    });
                    wx.showToast({
                        title: '已退出登录',
                        icon: 'success'
                    });
                }
            }
        });
    }
})
import {
    getAllUserInfo,
    getUserToday
} from '../../../api/admin'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageNum: 1,
        pageSize: 1,
        totalUsers: 0,
        todayUsers: 0,
        avgCorrectRate: 0,
        dailyQuestionRate: 0,
        dailyQuestionUserCount: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 加载数据
        this.loadUserStats()
        this.getUserToday()
    },
    loadUserStats() {
        const {
            pageNum,
            pageSize
        } = this.data;
        const data = {
            department: "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        console.log(data);
        getAllUserInfo(data).then(res => {
            console.log('用户统计数据:', res.pageInfo);
            if (res && res.pageInfo) {
                this.setData({
                    totalUsers: res.pageInfo.totalSize || 0,
                    avgCorrectRate: res.pageInfo.avgCorrectRate ? parseFloat(res.pageInfo.avgCorrectRate).toFixed(2) : '0.00',
                    dailyQuestionRate: res.pageInfo.dailyQuestionRate ? parseFloat(res.pageInfo.dailyQuestionRate).toFixed(2) : '0.00'
                });
            }
        }).catch(err => {
            console.error('获取用户统计失败:', err);
        });
    },
    getUserToday() {
        getUserToday().then(res => {
            console.log('今日数据:', res);
            if (res) {
                this.setData({
                    dailyQuestionRate: res.dailyQuestionRate ? parseFloat(res.dailyQuestionRate).toFixed(2) : '0.00',
                    dailyQuestionUserCount: res.dailyQuestionUserCount || 0
                });
            }
        }).catch(err => {
            console.error('获取今日数据失败:', err);
        });
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

    // 导航到用户答题统计页面
    navigateToUserStats() {
        wx.navigateTo({
            url: '/pages/admin/user-stats/index'
        })
    },

    // 导航到题目管理页面
    navigateToQuestionManage() {
        wx.navigateTo({
            url: '/pages/admin/question-manage/index'
        })
    },
    // 导航到法律管理页面
    navigateToLawManage() {
        wx.navigateTo({
            url: '/pages/admin/law/law'
        })
    },
    // 易错20题
    navigateTo20Mistake() {
        wx.navigateTo({
            url: '/pages/canMistake20/canMistake20'
        })
    }
})
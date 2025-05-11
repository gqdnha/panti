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
        dailyQuestionRate:0,
        dailyQuestionUserCount:0
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
            console.log(res.pageInfo);
            // 假设 res 包含 userList 和 totalPages 数据
            this.setData({
                totalUsers: res.pageInfo.totalSize
            });
            console.log(this.data.totalUsers);
        }).catch(err => {
            console.error(err);
        });
    },
    getUserToday() {
        getUserToday().then(res => {
            console.log(res);
            this.setData({
                dailyQuestionRate : res.dailyQuestionRate,
                dailyQuestionUserCount : res.dailyQuestionUserCount
            })
        })
        console.log(this.data.dailyQuestionRate);
        console.log(this.data.dailyQuestionUserCount);
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
            // url: '/pages/admin/mistake20/mistake20'
            url: '/pages/canMistake20/canMistake20'
        })
    }
})
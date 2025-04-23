// pages/admin/dashboard/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalUsers: 0,
    todayUsers: 0,
    avgCorrectRate: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载数据
    this.loadDashboardData()
  },

  loadDashboardData() {
    // TODO: 从服务器获取数据
    this.setData({
      totalUsers: 128,
      todayUsers: 12,
      avgCorrectRate: 85
    })
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
  }
})
// pages/admin/user-stats/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    userInfo: {},
    answerRecords: [],
    userList: [
      {
        id: 1,
        avatarUrl: '/images/default-avatar.png',
        nickName: '用户1',
        questionCount: 120,
        correctRate: 85
      },
      {
        id: 2,
        avatarUrl: '/images/default-avatar.png',
        nickName: '用户2',
        questionCount: 98,
        correctRate: 92
      },
      {
        id: 3,
        avatarUrl: '/images/default-avatar.png',
        nickName: '用户3',
        questionCount: 156,
        correctRate: 78
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id } = options;
    this.setData({
      userId: id
    });
    this.getUserInfo();
    this.getAnswerRecords();
    this.loadUserStats();
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
    this.getUserInfo();
    this.getAnswerRecords();
    wx.stopPullDownRefresh();
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
    // TODO: 从服务器获取用户信息
    // 这里使用模拟数据
    const userInfo = {
      avatarUrl: '/assets/images/default-avatar.png',
      nickName: '用户1',
      totalQuestions: 100,
      correctRate: 85,
      todayQuestions: 10,
      weekQuestions: 50,
      monthQuestions: 80
    };

    this.setData({
      userInfo
    });
  },

  getAnswerRecords() {
    // TODO: 从服务器获取答题记录
    // 这里使用模拟数据
    const answerRecords = [
      {
        id: 1,
        title: 'JavaScript基础测试',
        time: '2024-03-20 14:30',
        questionCount: 20,
        correctRate: 90,
        duration: 30
      },
      {
        id: 2,
        title: 'Vue.js进阶测试',
        time: '2024-03-19 16:45',
        questionCount: 15,
        correctRate: 85,
        duration: 25
      },
      {
        id: 3,
        title: 'React基础测试',
        time: '2024-03-18 10:20',
        questionCount: 25,
        correctRate: 80,
        duration: 35
      }
    ];

    this.setData({
      answerRecords
    });
  },

  viewAnswerDetail(e) {
    const { id } = e.currentTarget.dataset;
    // TODO: 跳转到答题详情页面
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  loadUserStats() {
    // TODO: 从服务器获取用户答题数据
  },

  // 查看用户详情
  viewDetail(e) {
    const userId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/user-detail/index?id=${userId}`
    })
  },

  // 导出用户数据
  exportUserData(e) {
    const userId = e.currentTarget.dataset.id
    // TODO: 实现导出用户数据的功能
    wx.showToast({
      title: '导出成功',
      icon: 'success'
    })
  }
})
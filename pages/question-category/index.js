// pages/question-category/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoryId: null,
    categoryInfo: {},
    questions: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id } = options;
    this.setData({
      categoryId: id
    });
    this.getCategoryInfo();
    this.getQuestionList();
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

  getCategoryInfo() {
    // TODO: 从服务器获取分类信息
    // 这里使用模拟数据
    const categoryMap = {
      1: {
        name: '单选题',
        description: '基础题型，每题只有一个正确答案'
      },
      2: {
        name: '多选题',
        description: '进阶题型，每题可能有多个正确答案'
      },
      3: {
        name: '判断题',
        description: '快速练习，判断对错'
      },
      4: {
        name: '简答题',
        description: '综合能力，需要详细解答'
      }
    };

    this.setData({
      categoryInfo: categoryMap[this.data.categoryId] || {}
    });
  },

  getQuestionList() {
    // TODO: 从服务器获取题目列表
    // 这里使用模拟数据
    const questions = [
      {
        id: 1,
        name: '基础练习1',
        questionCount: 10,
        estimatedTime: 15,
        status: 'completed'
      },
      {
        id: 2,
        name: '进阶练习1',
        questionCount: 15,
        estimatedTime: 20,
        status: 'in-progress'
      },
      {
        id: 3,
        name: '综合练习1',
        questionCount: 20,
        estimatedTime: 30,
        status: 'not-started'
      }
    ];

    this.setData({
      questions
    });
  },

  startQuestion(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/question/index?id=${id}&categoryId=${this.data.categoryId}`
    });
  }
})
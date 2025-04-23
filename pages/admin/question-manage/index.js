// pages/admin/question-manage/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionList: [
      {
        id: 1,
        title: '什么是JavaScript？',
        type: '选择题'
      },
      {
        id: 2,
        title: '解释CSS盒模型',
        type: '简答题'
      },
      {
        id: 3,
        title: 'HTML5新特性有哪些？',
        type: '选择题'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载题目列表
    this.loadQuestions()
  },

  loadQuestions() {
    // TODO: 从服务器获取题目列表
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

  // 导入题目
  importQuestions() {
    wx.showToast({
      title: '开发中...',
      icon: 'none'
    })
  },

  // 导出题目
  exportQuestions() {
    wx.showToast({
      title: '导出成功',
      icon: 'success'
    })
  },

  // 编辑题目
  editQuestion(e) {
    const questionId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/admin/question-edit/index?id=${questionId}`
    })
  },

  // 删除题目
  deleteQuestion(e) {
    const questionId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这道题目吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用删除接口
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  // 添加题目
  addQuestion() {
    wx.navigateTo({
      url: '/pages/admin/question-edit/index'
    })
  }
})
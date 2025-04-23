// pages/login/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //   到时候删除
    phone: '13581036903',
    code: '111111',
    // phone: '',
    // code: '',
    counting: false,
    countDown: 60
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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

  inputPhone(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  inputCode(e) {
    this.setData({
      code: e.detail.value
    });
  },

  sendCode() {
    const { phone } = this.data;
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    // 开始倒计时
    this.setData({
      counting: true
    });

    let count = 60;
    const timer = setInterval(() => {
      count--;
      this.setData({
        countDown: count
      });
      if (count === 0) {
        clearInterval(timer);
        this.setData({
          counting: false,
          countDown: 60
        });
      }
    }, 1000);

    // TODO: 调用发送验证码接口
    wx.showToast({
      title: '验证码已发送',
      icon: 'success'
    });
  },

  handleLogin() {
    const { phone, code } = this.data;
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    if (!code || code.length !== 6) {
      wx.showToast({
        title: '请输入正确的验证码',
        icon: 'none'
      });
      return;
    }

    // TODO: 调用登录接口
    wx.showLoading({
      title: '登录中...'
    });

    // 模拟登录请求
    setTimeout(() => {
      wx.hideLoading();
      // 存储用户信息
      wx.setStorageSync('userInfo', {
        phone,
        isAdmin: false // 这里需要根据实际接口返回判断
      });

      // 根据用户角色跳转到不同页面
      const isAdmin = false; // 这里需要根据实际接口返回判断
      if (isAdmin) {
        wx.redirectTo({
          url: '/pages/admin/dashboard/index'
        });
      } else {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    }, 1500);
  }
})
// app.js
import { setupTabBar } from './utils/tabBar';

App({
  onLaunch() {
    // 设置tabBar显示
    setupTabBar();

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    // 定义tabBar配置
    tabBarConfig: {
      color: "#666666",
      selectedColor: "#1890ff",
      backgroundColor: "#e6f7ff",
      list: [
        {
          pagePath: "pages/index/index",
          text: "首页",
          iconPath: "/assets/icons/home.png",
          selectedIconPath: "/assets/icons/home-active.png"
        },
        {
          pagePath: "pages/user-info/index",
          text: "我的",
          iconPath: "/assets/icons/user.png",
          selectedIconPath: "/assets/icons/user-active.png"
        },
        {
          pagePath: "pages/admin/dashboard/index",
          text: "管理",
          iconPath: "/assets/icons/admin.png",
          selectedIconPath: "/assets/icons/admin-active.png"
        }
      ]
    }
  }
})

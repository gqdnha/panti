Component({
  data: {
    selected: 0,
    color: "#666666",
    selectedColor: "#1890ff",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "/assets/icons/home.png",
        selectedIconPath: "/assets/icons/home-active.png"
      },
      {
        pagePath: "/pages/user-info/index",
        text: "我的",
        iconPath: "/assets/icons/user.png",
        selectedIconPath: "/assets/icons/user-active.png"
      }
    ]
  },
  lifetimes: {
    attached() {
      this.updateTabBar();
    }
  },
  pageLifetimes: {
    show() {
      this.updateTabBar();
    }
  },
  methods: {
    updateTabBar() {
      const role = wx.getStorageSync('role');
      const list = [
        {
          pagePath: "/pages/index/index",
          text: "首页",
          iconPath: "/assets/icons/home.png",
          selectedIconPath: "/assets/icons/home-active.png"
        },
        {
          pagePath: "/pages/user-info/index",
          text: "我的",
          iconPath: "/assets/icons/user.png",
          selectedIconPath: "/assets/icons/user-active.png"
        }
      ];
      
      if (role === 'admin') {
        list.push({
          pagePath: "/pages/admin/dashboard/index",
          text: "管理",
          iconPath: "/assets/icons/admin.png",
          selectedIconPath: "/assets/icons/admin-active.png"
        });
      }
      
      this.setData({
        list: list
      });
    },
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      const index = data.index;
      
      // 检查是否点击的是"我的"页面
      if (url === "/pages/user-info/index") {
        const name = wx.getStorageSync('name');
        const role = wx.getStorageSync('role');
        
        // 检查是否登录
        if (!name && !role) {
          wx.showModal({
            title: '提示',
            content: '您未登录',
            confirmText: '去登录',
            cancelText: '取消',
            showCancel: true,
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/login/index'
                });
              } else {
                // 点击取消，保持在首页
                this.setData({
                  selected: 0
                });
              }
            }
          });
          return; // 阻止跳转
        }
      }
      
      // 检查是否是管理页面
      if (url.includes('/admin/')) {
        const role = wx.getStorageSync('role');
        if (role !== 'admin') {
          wx.showToast({
            title: '无权限访问',
            icon: 'none'
          });
          return;
        }
      }
      
      wx.switchTab({
        url
      });
      this.setData({
        selected: index
      });
    }
  }
}); 
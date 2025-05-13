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
  attached() {
    this.updateTabBar();
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
        selected: data.index
      });
    }
  }
}); 
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
      },
      {
        pagePath: "/pages/admin/dashboard/index",
        text: "管理",
        iconPath: "/assets/icons/admin.png",
        selectedIconPath: "/assets/icons/admin-active.png"
      }
    ]
  },
  attached() {
    // 获取用户角色
    const role = wx.getStorageSync('role');
    // 如果是普通用户，只显示首页和我的
    if (role === 'user') {
      this.setData({
        list: this.data.list.slice(0, 2)
      });
    }
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({
        url
      });
      this.setData({
        selected: data.index
      });
    }
  }
}); 
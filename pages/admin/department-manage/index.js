Page({
  data: {
    searchKeyword: '',
    departments: [
      { id: 1, name: '人事部', active: true },
      { id: 2, name: '技术部', active: true },
      { id: 3, name: '财务部', active: false }
    ],
    allDepartments: [
      { id: 1, name: '人事部', active: true },
      { id: 2, name: '技术部', active: true },
      { id: 3, name: '财务部', active: false }
    ]
  },
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },
  onSearch() {
    // 这里预留后端接口对接
    // wx.request({ url: '/api/department/search', data: { keyword: this.data.searchKeyword }, ... })
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      this.setData({ departments: this.data.allDepartments });
      return;
    }
    const filtered = this.data.allDepartments.filter(dept => dept.name.includes(keyword));
    this.setData({ departments: filtered });
  },
  toggleDeptStatus(e) {
    const id = e.currentTarget.dataset.id;
    const departments = this.data.departments.map(dept => {
      if (dept.id === id) {
        return { ...dept, active: !dept.active };
      }
      return dept;
    });
    const allDepartments = this.data.allDepartments.map(dept => {
      if (dept.id === id) {
        return { ...dept, active: !dept.active };
      }
      return dept;
    });
    this.setData({ departments, allDepartments });
  },
  authDept(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '授权功能待实现',
      icon: 'none'
    });
  }
}); 
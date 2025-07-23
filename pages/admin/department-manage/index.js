import { getApartmentList } from '../../../api/apartmentAdmin'

Page({
  data: {
    searchKeyword: '',
    departments: [],
    allDepartments: []
  },
  onLoad() {
    // 页面加载时获取部门列表
    getApartmentList().then(res => {
      // 假设res为部门数组，字段有id、name、active
      this.setData({
        departments: res,
        allDepartments: res
      });
    });
  },
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },
  onSearch() {
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
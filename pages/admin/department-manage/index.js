import {
    getApartmentList,
    downLoadUserText,disableDepartment,grantDepartment
} from '../../../api/apartmentAdmin'

Page({
    data: {
        searchKeyword: '',
        departments: [],
        allDepartments: []
    },

    onLoad() {
        this.getApartmentListApi()
    },
    // 页面加载时获取部门列表

    getApartmentListApi() {
        getApartmentList().then(res => {
            console.log(res);
            // 假设res为部门数组，字段有id、name、active
            this.setData({
                departments: res
            });
            console.log(this.data.departments);
        });
    },

    // 切换部门启用/停用状态（保持不变）
    toggleDeptStatus(e) {
        const department = e.currentTarget.dataset.department;
        console.log(department);
        const dept = this.data.departments.find(d => d.department === department);
        console.log(dept.isActive);
        if (!dept) return;

        const departmentName = dept.department; // 你的接口需要 department 字段
        console.log(departmentName);
        const isActive = dept.isActive;
        console.log(isActive);

        // 选择接口
        const apiCall = isActive==0 ? disableDepartment : grantDepartment;

        wx.showLoading({ title: '操作中...' });
        apiCall(departmentName)
            .then(res => {
                console.log(departmentName);
                wx.hideLoading();
                this.getApartmentListApi()
                wx.showToast({ title: isActive ? '已停用' : '已启用' });
                /* if (res && res.success) {
                    wx.showToast({ title: isActive ? '已停用' : '已启用' });
                    // 推荐刷新列表，保证和后端一致
                    this.getApartmentListApi();
                } else {
                    wx.showToast({ title: '操作失败', icon: 'none' });
                } */
            })
            .catch(err => {
                wx.hideLoading();
                wx.showToast({ title: '网络错误', icon: 'none' });
            });
    },

    // 新增：导出部门数据（核心功能）
    exportDept(e) {
        // 获取当前部门的ID和名称
        const name = e.currentTarget.dataset;
        // 以数组形式传递部门名称（满足后端接收数组的要求）
        const deptList = [name];

        console.log(`导出部门：${name}`, deptList);

        // 调用导出接口
        downLoadUserText(deptList).then(res => {
            if (res.success) {
                wx.showToast({
                    title: `部门【${name}】导出成功`,
                    icon: 'success'
                });
            } else {
                wx.showToast({
                    title: `导出失败：${res.message || '未知错误'}`,
                    icon: 'none'
                });
            }
        }).catch(err => {
            console.error('导出接口调用失败：', err);
            wx.showToast({
                title: `导出失败，请重试`,
                icon: 'none'
            });
        });
    }
});
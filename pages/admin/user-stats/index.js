import {
    getAllUserInfo
} from '../../../api/admin'
import {
    getUserInfo,unUseUser
} from '../../../api/getUserInfo'
import {
    getUserDailyFinish
} from '../../../api/getDeilyFinash'

import {
    downLoadUserText
} from '../../../api/downLoadUserText'

Page({
    data: {
        // 基础数据
        department: '',
        rightPercent: 0,
        userId: null,
        userInfo: {},
        userList: [],
        pageNum: 1,
        pageSize: 8,
        totalPages: 1,
        searchKeyword: '',
        
        // 禁用功能相关
        isDisableMode: false,  // 是否显示禁用功能
        hasSelected: false,    // 是否有选中项
        
        // 弹窗相关（恢复原始字段名）
        showUserDetailModal: false,  // 弹窗显示状态
        currentUserDetail: {},       // 当前查看的用户详情
        dailyFinishData: null,
        loadingDailyFinish: false,
    },

    onLoad(options) {
        const department = wx.getStorageSync('department');
        this.setData({ department: department || '' });
        this.loadUserStats();
    },

    // 加载用户列表
    loadUserStats() {
        const { pageNum, pageSize, searchKeyword, department } = this.data;
        const data = {
            department: department === '超级管理员' ? "" : department,
            userName: searchKeyword || "",
            pageNum,
            pageSize
        };

        getAllUserInfo(data).then(res => {
            // 初始化选中状态和禁用状态
            const userList = res.pageInfo.pageData.map(user => ({
                ...user,
                checked: false,        // 选中状态
                disabled: user.disabled || false  // 禁用状态
            }));
            this.setData({
                userList,
                totalPages: res.pageInfo.totalPage
            });
        }).catch(err => {
            console.error('获取用户列表失败:', err);
            wx.showToast({ title: '加载失败', icon: 'none' });
        });
    },

    // 搜索相关
    onSearchInput(e) {
        this.setData({ searchKeyword: e.detail.value });
    },
    onSearch() {
        this.setData({ pageNum: 1 }, () => this.loadUserStats());
    },

    // 禁用功能：进入禁用模式
    showDisableMode() {
        this.setData({ isDisableMode: true });
    },

    // 禁用功能：取消禁用模式
    exitDisableMode() {
        // 重置选中状态
        const userList = this.data.userList.map(user => ({
            ...user,
            checked: false
        }));
        this.setData({
            isDisableMode: false,
            userList,
            hasSelected: false
        });
    },

    // 行点击切换选中状态（禁用模式下）
    toggleRowSelect(e) {
        const index = e.currentTarget.dataset.index;
        const userList = [...this.data.userList];
        
        // 跳过已禁用用户
        if (userList[index].disabled) return;
        
        // 切换选中状态
        userList[index].checked = !userList[index].checked;
        // 判断是否有选中项
        const hasSelected = userList.some(user => user.checked);
        
        this.setData({ userList, hasSelected });
    },

    // 复选框组变更
    onCheckboxChange(e) {
        const selectedIds = e.detail.value || [];
        console.log('当前选中的用户ID:', selectedIds);
        
        // 同步选中状态
        const userList = [...this.data.userList];
        userList.forEach(user => {
            user.checked = selectedIds.includes(String(user.user_id));
        });
        
        this.setData({ 
            userList, 
            hasSelected: selectedIds.length > 0 
        });
    },

    // 阻止复选框点击冒泡
    stopPropagation() {
        // 仅阻止事件冒泡到行
    },

    // 提交禁用
    submitDisable() {
        // 获取选中的未禁用用户ID
        const selectedUsers = this.data.userList.filter(user => 
            user.checked && !user.disabled
        );
        const selectedIds = selectedUsers.map(user => user.user_id);
        
        if (selectedIds.length === 0) {
            wx.showToast({ title: '请选择用户', icon: 'none' });
            return;
        }

        // 控制台打印选中的ID
        console.log('提交禁用的用户ID:', selectedIds);

        // 模拟禁用API调用（实际项目打开注释）
        
        unUseUser(selectedIds).then(res => {
            console.log(res);
            wx.showToast({ title: '禁用成功', icon: 'success' });
            // 更新用户状态
            const userList = this.data.userList.map(user => ({
                ...user,
                checked: false,
                disabled: selectedIds.includes(user.user_id) ? true : user.disabled
            }));
            this.setData({ userList, isDisableMode: false, hasSelected: false });
        }).catch(err => {
            console.error('禁用失败:', err);
            wx.showToast({ title: '禁用失败', icon: 'none' });
        });
       

        // 模拟禁用成功
        wx.showToast({ title: '禁用成功', icon: 'success' });
        const userList = this.data.userList.map(user => ({
            ...user,
            checked: false,
            disabled: selectedIds.includes(user.user_id) ? true : user.disabled
        }));
        this.setData({ userList, isDisableMode: false, hasSelected: false });
    },

    // 分页
    prevPage() {
        if (this.data.pageNum > 1) {
            this.setData({ pageNum: this.data.pageNum - 1 }, () => this.loadUserStats());
        }
    },
    nextPage() {
        if (this.data.pageNum < this.data.totalPages) {
            this.setData({ pageNum: this.data.pageNum + 1 }, () => this.loadUserStats());
        }
    },

    // 查看用户详情（弹窗核心逻辑）
    viewDetail(e) {
        const userId = e.currentTarget.dataset.id;
        const user = this.data.userList.find(u => u.user_id === userId);
        if (!user) {
            wx.showToast({ title: '未找到用户', icon: 'none' });
            return;
        }

        // 显示弹窗并加载详情数据
        this.setData({
            showUserDetailModal: true,  // 打开弹窗
            currentUserDetail: user,
            dailyFinishData: null,
            loadingDailyFinish: true
        });

        // 加载正确率
        getUserInfo().then(res => {
            this.setData({ rightPercent: res.rightPercent });
        }).catch(err => {
            console.error('获取正确率失败:', err);
        });

        // 加载每日练习完成情况
        getUserDailyFinish(user.user_id).then(res => {
            this.setData({
                dailyFinishData: res === 100 ? '已完成' : '未完成',
                loadingDailyFinish: false
            });
        }).catch(err => {
            this.setData({ dailyFinishData: '未完成', loadingDailyFinish: false });
        });
    },

    // 关闭详情弹窗
    closeUserDetailModal() {
        this.setData({ showUserDetailModal: false });
    },

    // 错题本跳转
    goToOneWrongBook() {
        const id = this.data.currentUserDetail.user_id;
        wx.navigateTo({ url: `/pages/userPages/oneWrongBook/ontWrongBook?id=${id}` });
    },

    // 导出功能
    downLoadUserText() {
        downLoadUserText().then(res => {
            console.log('导出结果:', res);
        }).catch(err => {
            console.error('导出失败:', err);
        });
    }
});
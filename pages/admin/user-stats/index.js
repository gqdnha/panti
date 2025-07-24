import {
    getAllUserInfo
} from '../../../api/admin'
import {
    getUserInfo
} from '../../../api/getUserInfo'
import {
    getUserDailyFinish
} from '../../../api/getDeilyFinash'
import {
    request
} from '../../../api/request'
import {
    downLoadUserText
} from '../../../api/downLoadUserText'
import {
    unuseUser
} from '../../../api/apartmentAdmin'

Page({
    data: {
        department: '',
        rightPercent: 0,
        userId: null,
        userInfo: {},
        answerRecords: [],
        userList: [],  // 存储用户列表，包含checked状态
        pageNum: 1,
        pageSize: 8,
        totalPages: 1,
        searchKeyword: '',
        showUserDetailModal: false,
        currentUserDetail: {},
        showModal: false,
        newUser: {
            name: '',
            phone: '',
            department: ''
        },
        dailyFinishData: null,
        loadingDailyFinish: false,
    },

    onLoad(options) {
        // 获取部门信息
        const department = wx.getStorageSync('department');
        this.setData({ department: department || '' });
        this.loadUserStats();  // 加载用户列表
    },

    // 加载用户列表（初始化checked状态）
    loadUserStats() {
        const { pageNum, pageSize, searchKeyword, department } = this.data;
        const data = {
            department: department === '超级管理员' ? "" : department,
            userName: searchKeyword || "",
            pageNum,
            pageSize
        };

        getAllUserInfo(data).then(res => {
            console.log('获取用户数据:', res);
            // 为每个用户添加checked状态（默认未选中）
            const userList = res.pageInfo.pageData.map(user => ({
                ...user,
                checked: false  // 关键：初始化选中状态
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

    // 搜索输入处理
    onSearchInput(e) {
        this.setData({ searchKeyword: e.detail.value });
    },

    // 执行搜索
    onSearch() {
        this.setData({ pageNum: 1 }, () => this.loadUserStats());
    },

    // 查看用户详情
    viewDetail(e) {
        const { id } = e.currentTarget.dataset;
        const user = this.data.userList.find(item => item.user_id === id);
        if (!user) {
            wx.showToast({ title: '未找到用户', icon: 'none' });
            return;
        }

        this.setData({
            showUserDetailModal: true,
            currentUserDetail: user,
            dailyFinishData: null,
            loadingDailyFinish: true
        });

        // 获取正确率
        getUserInfo().then(res => {
            this.setData({ rightPercent: res.rightPercent });
        }).catch(err => {
            console.error('获取正确率失败:', err);
        });

        // 获取每日练习完成情况
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
        this.setData({ showUserDetailModal: false, dailyFinishData: null });
    },

    // 分页：上一页
    onPreviousPage() {
        if (this.data.pageNum > 1) {
            this.setData({ pageNum: this.data.pageNum - 1 }, () => this.loadUserStats());
        }
    },

    // 分页：下一页
    onNextPage() {
        if (this.data.pageNum < this.data.totalPages) {
            this.setData({ pageNum: this.data.pageNum + 1 }, () => this.loadUserStats());
        }
    },

    // 跳转错题本
    goToOneWrongBook() {
        const id = this.data.currentUserDetail.user_id;
        wx.navigateTo({ url: `/pages/userPages/oneWrongBook/ontWrongBook?id=${id}` });
    },

    // 导出用户数据
    downLoadUserText() {
        downLoadUserText().then(res => {
            console.log('导出结果:', res);
        }).catch(err => {
            console.error('导出失败:', err);
        });
    },

    // 跳转每日练习
    goToOneDaily(e) {
        const id = this.data.currentUserDetail.user_id;
        wx.navigateTo({ url: `/pages/userPages/oneDaily/oneDaily?id=${id}` });
    },

    // 行点击切换选中状态
    toggleRowSelection(e) {
        // 跳过由复选框触发的事件（避免重复处理）
        if (e.target.dataset.type === 'checkbox') return;
        
        const index = e.currentTarget.dataset.index;
        const userList = [...this.data.userList];
        userList[index].checked = !userList[index].checked;
        
        this.setData({ userList }, () => {
            console.log('当前选中的用户ID:', 
                userList.filter(u => u.checked).map(u => u.user_id));
        });
    },

    // 复选框变更处理
    onCheckboxChange(e) {
        const selectedIds = e.detail.value;  // 字符串数组
        console.log('复选框选中ID:', selectedIds);
        
        const userList = [...this.data.userList];
        userList.forEach(user => {
            // 确保类型一致（user_id转字符串后比较）
            user.checked = selectedIds.includes(user.user_id + '');
        });
        
        // this.setData({ userList });
    },

    // 移除stopPropagation方法（不再需要）
});
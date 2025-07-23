import { getAllUserInfo } from '../../../api/admin'
import {getUserInfo} from '../../../api/getUserInfo'
import { getUserDailyFinish } from '../../../api/getDeilyFinash'
import { request } from '../../../api/request'
import {downLoadUserText} from '../../../api/downLoadUserText'
import { unuseUser } from '../../../api/apartmentAdmin'

Page({
    data: {
        department: '',
        // 正确率
        rightPercent:0,
        userId: null,
        userInfo: {},
        answerRecords: [],
        userList: [],
        pageNum: 1,
        pageSize: 8,
        totalPages: 1,
        searchKeyword: '',
        showUserDetailModal: false, // 控制用户详情模态框的显示与隐藏
        currentUserDetail: {}, // 当前要显示详情的用户信息
        showModal: false,
        newUser: {
            name: '',
            phone: '',
            department: ''
        },
        dailyFinishData: null, // 每日练习完成情况
        loadingDailyFinish: false, // 加载每日练习完成情况的状态
        showCheckbox: false,
        selectedUserIds: [],
    },

    onLoad(options) {
        // 获取部门信息
        const department = wx.getStorageSync('department');
        console.log('当前用户部门：', department);
        
        this.setData({
            department: department || ''
        });

        // 打印部门信息，用于调试
        console.log('页面数据中的部门信息：', this.data.department);

        this.loadUserStats();
    },

    loadUserStats() {
        const { pageNum, pageSize, searchKeyword, department } = this.data;
        const data = {
            // 如果是超级管理员，department传空字符串，否则传当前用户的department
            department: department === '超级管理员' ? "" : department,
            // 判断 searchKeyword 是否有值，有则传其值，否则传空字符串
            userName: searchKeyword || "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        console.log('请求参数：', data);
        getAllUserInfo(data).then(res => {
            console.log('获取到的数据：', res);
            // 假设 res 包含 userList 和 totalPages 数据
            this.setData({
                userList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage
            });
            console.log('用户列表：', this.data.userList);
            console.log('总页数：', this.data.totalPages);
        }).catch(err => {
            console.error('请求失败：', err);
        });
    },

    onSearchInput(e) {
        this.setData({
            searchKeyword: e.detail.value
        });
    },

    onSearch() {
        // 重置页码为 1
        this.setData({ pageNum: 1 });
        this.loadUserStats();
    },

    viewAnswerDetail(e) {
        const { id } = e.currentTarget.dataset;
        wx.showToast({
            title: '功能开发中',
            icon: 'none'
        });
    },

    viewDetail(e) {
        const { id } = e.currentTarget.dataset;
        console.log('点击的用户ID:', id);
        const user = this.data.userList.find(item => item.user_id === id);
        console.log('找到的用户信息:', user);
        
        if (!user) {
            wx.showToast({
                title: '未找到用户信息',
                icon: 'none'
            });
            return;
        }

        this.setData({
            showUserDetailModal: true,
            currentUserDetail: user,
            dailyFinishData: null, // 重置每日练习数据
            loadingDailyFinish: true // 开始加载
        });

        // 获取用户正确率
        getUserInfo().then(res => {
            console.log('获取到的用户信息:', res);
            this.setData({
                rightPercent: res.rightPercent
            });
        }).catch(err => {
            console.error('获取用户信息失败:', err);
            wx.showToast({
                title: '获取用户信息失败',
                icon: 'none'
            });
        });

        // 获取用户每日练习完成情况
        getUserDailyFinish(user.user_id).then(res => {
            console.log('获取到的每日练习完成情况:', res);
            
            // 判断是否完成：如果是100则已完成，否则未完成
            const statusText = res === 100 ? '已完成' : '未完成';
            
            this.setData({
                dailyFinishData: statusText,
                loadingDailyFinish: false
            });
        }).catch(err => {
            console.error('获取每日练习完成情况失败:', err);
            this.setData({
                dailyFinishData: '未完成',
                loadingDailyFinish: false
            });
        });
    },

    closeUserDetailModal() {
        this.setData({
            showUserDetailModal: false,
            dailyFinishData: null // 清空数据
        });
    },

    onNextPage() {
        const { pageNum, totalPages } = this.data;
        if (pageNum < totalPages) {
            this.setData({ pageNum: pageNum + 1 });
            this.loadUserStats();
        } else {
            wx.showToast({
                title: '已经是最后一页了',
                icon: 'none'
            });
        }
    },

    onPreviousPage() {
        const { pageNum } = this.data;
        if (pageNum > 1) {
            this.setData({ pageNum: pageNum - 1 });
            this.loadUserStats();
        } else {
            wx.showToast({
                title: '已经是第一页了',
                icon: 'none'
            });
        }
    },

    editQuestion(e) {
        const questionId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/admin/question-edit/index?id=${questionId}`
        });
    },


    onNewQuestionInput(e) {
        const { field } = e.currentTarget.dataset;
        const value = e.detail.value;
        this.setData({
            newQuestion: {
               ...this.data.newQuestion,
                [field]: value
            }
        });
    },

    goToOneWrongBook() {
        const currentUserId = this.data.currentUserDetail.user_id;
        console.log(currentUserId);
        wx.navigateTo({
            url: `/pages/userPages/oneWrongBook/ontWrongBook?id=${currentUserId}`
        });
    },
    // 新增导出
    downLoadUserText(){
        downLoadUserText().then(res => {
            console.log(res);
            // console.log('111');
        })
    },

    goToOneDaily(e) {
        const currentUserId = this.data.currentUserDetail.user_id;
        console.log(currentUserId);

        wx.navigateTo({
            // url: `/pages/userPages/oneWrongBook/ontWrongBook?id=${currentUserId}`
            url: `/pages/userPages/oneDaily/oneDaily?id=${currentUserId}`
        });
    },

    // 获取用户列表
    getUserList() {
        request({
            url: '/user/list',
            method: 'GET'
        }).then(res => {
            this.setData({
                userList: res.data
            });
        }).catch(err => {
            console.error('获取用户列表失败:', err);
            wx.showToast({
                title: '获取用户列表失败',
                icon: 'none'
            });
        });
    },
    onBatchDisable() {
        this.setData({ showCheckbox: !this.data.showCheckbox });
        if (!this.data.showCheckbox) {
            this.setData({ selectedUserIds: [] });
        }
    },
    onCheckboxChange(e) {
        const userId = e.currentTarget.dataset.userid;
        let selected = this.data.selectedUserIds.slice();
        if (e.detail.value.length > 0) {
            if (selected.indexOf(userId) === -1) selected.push(userId);
        } else {
            selected = selected.filter(id => id !== userId);
        }
        this.setData({ selectedUserIds: selected });
    },
    async onConfirmBatchDisable() {
        const ids = this.data.selectedUserIds;
        if (!ids.length) {
            wx.showToast({ title: '请先选择要禁用的用户', icon: 'none' });
            return;
        }
        try {
            await unuseUser(ids.join(','));
            wx.showToast({ title: '批量禁用成功', icon: 'success' });
            this.setData({ showCheckbox: false, selectedUserIds: [] });
            this.loadUserStats();
        } catch (e) {
            wx.showToast({ title: '禁用失败', icon: 'none' });
        }
    },
    async onDisableUser(e) {
        const userId = e.currentTarget.dataset.id;
        try {
            await unuseUser(userId);
            wx.showToast({ title: '禁用成功', icon: 'success' });
            this.loadUserStats();
        } catch (e) {
            wx.showToast({ title: '禁用失败', icon: 'none' });
        }
    },
});
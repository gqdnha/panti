import { getAllUserInfo } from '../../../api/admin'
import {getUserInfo} from '../../../api/getUserInfo'
import { request } from '../../../api/request'

Page({
    data: {
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
        }
    },

    onLoad(options) {
        this.loadUserStats();
    },

    loadUserStats() {
        const { pageNum, pageSize, searchKeyword } = this.data;
        const data = {
            department: "",
            // 判断 searchKeyword 是否有值，有则传其值，否则传空字符串
            userName: searchKeyword || "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        console.log(data);
        getAllUserInfo(data).then(res => {
            console.log(res);
            // 假设 res 包含 userList 和 totalPages 数据
            this.setData({
                userList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage
            });
            console.log(this.data.userList);
            console.log(this.data.totalPages);
        }).catch(err => {
            console.error(err);
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
            currentUserDetail: user
        });

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
    },

    closeUserDetailModal() {
        this.setData({
            showUserDetailModal: false
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

    // 显示添加用户弹窗
    showAddUserModal() {
        this.setData({
            showModal: true,
            newUser: {
                name: '',
                phone: '',
                department: ''
            }
        });
    },

    // 隐藏添加用户弹窗
    hideAddUserModal() {
        this.setData({
            showModal: false
        });
    },

    // 输入姓名
    onNameInput(e) {
        this.setData({
            'newUser.name': e.detail.value
        });
    },

    // 输入手机号
    onPhoneInput(e) {
        this.setData({
            'newUser.phone': e.detail.value
        });
    },

    // 输入部门
    onDepartmentInput(e) {
        this.setData({
            'newUser.department': e.detail.value
        });
    },

    // 添加用户
    handleAddUser() {
        const { name, phone, department } = this.data.newUser;

        // 验证输入
        if (!name || !phone || !department) {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none'
            });
            return;
        }

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return;
        }

        // 调用添加用户接口
        request({
            url: '/user/add',
            method: 'POST',
            data: {
                name,
                phone,
                department
            }
        }).then(res => {
            wx.showToast({
                title: '添加成功',
                icon: 'success'
            });
            this.hideAddUserModal();
            this.getUserList(); // 刷新用户列表
        }).catch(err => {
            console.error('添加用户失败:', err);
            wx.showToast({
                title: '添加失败，请重试',
                icon: 'none'
            });
        });
    }
});
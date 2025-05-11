import { request } from '../../api/request';

Page({
    data: {
        showPhoneVerify: false,
        phone: '',
        name: '',
        department: '',
        loginCode: '', // 保存登录code
        userId: '', // 保存用户ID
        departmentList: ['研发部', '市场部', '销售部', '人事部', '财务部', '行政部'], // 部门列表
        departmentIndex: 0 // 默认选中第一个
    },

    // 微信登录
    wxLogin() {
        wx.showLoading({
            title: '登录中...',
        });

        // 调用wx.login获取code
        wx.login({
            success: (res) => {
                if (res.code) {
                    // 保存code供后续使用
                    this.setData({
                        loginCode: res.code
                    });
                    
                    // 发送code到后端
                    request({
                        url: '/user/login',
                        method: 'POST',
                        data: {
                            code: res.code
                        }
                    }).then(res => {
                        wx.hideLoading();
                        // 保存用户信息到缓存
                        wx.setStorageSync('token', res.token);
                        wx.setStorageSync('userId', res.userId);
                        wx.setStorageSync('name', res.name);
                        wx.setStorageSync('phone', res.phone);
                        wx.setStorageSync('role', res.role);
                        wx.setStorageSync('department', res.department);
                        
                        this.setData({
                            userId: res.userId
                        });
                        
                        // 判断是否需要验证手机号
                        if (!res.phone) {
                            // 手机号为空，显示验证界面
                            this.setData({
                                showPhoneVerify: true
                            });
                        } else {
                            // 手机号不为空，直接跳转首页
                            wx.showToast({
                                title: '登录成功',
                                icon: 'success',
                                duration: 1500,
                                success: () => {
                                    setTimeout(() => {
                                        wx.switchTab({
                                            url: '/pages/index/index'
                                        });
                                    }, 1500);
                                }
                            });
                        }
                    }).catch(err => {
                        wx.hideLoading();
                        console.error('登录请求失败:', err);
                        wx.showToast({
                            title: '登录失败，请重试',
                            icon: 'none'
                        });
                    });
                } else {
                    wx.hideLoading();
                    wx.showToast({
                        title: '获取登录凭证失败',
                        icon: 'none'
                    });
                }
            },
            fail: (error) => {
                wx.hideLoading();
                console.error('wx.login失败：', error);
                wx.showToast({
                    title: '登录失败，请重试',
                    icon: 'none'
                });
            }
        });
    },

    // 手机号输入处理
    onPhoneInput(e) {
        this.setData({
            phone: e.detail.value
        });
    },

    // 姓名输入处理
    onNameInput(e) {
        this.setData({
            name: e.detail.value
        });
    },

    // 选择部门
    onDepartmentChange(e) {
        const index = e.detail.value;
        this.setData({
            department: this.data.departmentList[index],
            departmentIndex: index
        });
    },

    // 验证手机号
    verifyPhone() {
        const { phone, name, department, userId } = this.data;
        
        // 验证输入
        if (!phone || phone.length !== 11) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return;
        }
        if (!name || name.trim() === '') {
            wx.showToast({
                title: '请输入姓名',
                icon: 'none'
            });
            return;
        }

        wx.showLoading({
            title: '提交中...',
        });

        request({
            url: '/user/addUserInfo',
            method: 'POST',
            data: {
                userId: userId,
                phone: phone,
                name: name,
                department: department
            }
        }).then(res => {
            wx.hideLoading();
            if (res.success) {
                // 保存用户信息到缓存
                wx.setStorageSync('name', name);
                wx.setStorageSync('phone', phone);
                wx.setStorageSync('department', department);
                
                wx.showToast({
                    title: '提交成功',
                    icon: 'success',
                    duration: 1500,
                    success: () => {
                        setTimeout(() => {
                            wx.switchTab({
                                url: '/pages/index/index'
                            });
                        }, 1500);
                    }
                });
            } else {
                wx.showToast({
                    title: res.message || '提交失败',
                    icon: 'none'
                });
            }
        }).catch(err => {
            wx.hideLoading();
            console.error('提交失败:', err);
            wx.showToast({
                title: '提交失败，请重试',
                icon: 'none'
            });
        });
    }
});
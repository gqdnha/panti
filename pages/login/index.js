import { request } from '../../api/request';

Page({
    data: {
        showPhoneVerify: false,
        phone: '',
        loginCode: '' // 保存登录code
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
                        // 保存登录态和用户ID
                        wx.setStorageSync('token', res.token);
                        wx.setStorageSync('userId', res.userId);
                        
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

    // 验证手机号
    verifyPhone() {
        const { phone, loginCode } = this.data;
        if (!phone || phone.length !== 11) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return;
        }

        wx.showLoading({
            title: '验证中...',
        });

        request({
            url: '/user/verify-phone',
            method: 'POST',
            data: {
                phone: phone,
                code: loginCode
            }
        }).then(res => {
            wx.hideLoading();
            if (res.success) {
                wx.setStorageSync('phone', phone);
                
                wx.showToast({
                    title: '验证成功',
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
                    title: res.message || '验证失败',
                    icon: 'none'
                });
            }
        }).catch(err => {
            wx.hideLoading();
            console.error('手机号验证失败:', err);
            wx.showToast({
                title: '验证失败，请重试',
                icon: 'none'
            });
        });
    }
});
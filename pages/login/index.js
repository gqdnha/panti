import { request } from '../../api/request';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        phone: '',
        isNewUser: false, // 是否是新用户
        showPhoneVerify: false, // 是否显示手机号验证界面
        code: '111111',
        counting: false,
        countDown: 60
    },

    onLoad() {
        // 页面加载时直接进行微信登录
        this.wxLogin();
    },

    // 微信登录
    wxLogin() {
        wx.login({
            success: (res) => {
                console.log(res.code);
                /* if (res.code) {
                    // 获取用户信息
                    wx.getUserProfile({
                        desc: '用于完善用户资料',
                        success: (userInfo) => {
                            // 调用微信登录接口
                            request({
                                url: '/user/login',
                                method: 'POST',
                                data: {
                                    code: res.code,
                                }
                            }).then(res => {
                                if (res.isNewUser) {
                                    // 新用户，显示手机号验证界面
                                    this.setData({
                                        isNewUser: true,
                                        showPhoneVerify: true
                                    });
                                } else {
                                    // 老用户，直接跳转首页
                                    wx.setStorageSync('token', res.token);
                                    wx.setStorageSync('userId', res.userId);
                                    wx.switchTab({
                                        url: '/pages/index/index'
                                    });
                                }
                            }).catch(err => {
                                console.error('微信登录失败:', err);
                                wx.showToast({
                                    title: '登录失败，请重试',
                                    icon: 'none'
                                });
                            });
                        },
                        fail: (err) => {
                            console.error('获取用户信息失败:', err);
                            wx.showToast({
                                title: '获取用户信息失败',
                                icon: 'none'
                            });
                        }
                    });
                } */
            }
        });
    },

    // 输入手机号
    onPhoneInput(e) {
        this.setData({
            phone: e.detail.value
        });
    },

    // 验证手机号
    verifyPhone() {
        const { phone } = this.data;
        
        if (!phone) {
            wx.showToast({
                title: '请输入手机号',
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

        // 调用验证手机号接口
        request({
            url: '/user/verifyPhone',
            method: 'POST',
            data: {
                phone
            }
        }).then(res => {
            // 验证成功，保存token和用户ID
            wx.setStorageSync('token', res.token);
            wx.setStorageSync('userId', res.userId);
            
            // 跳转到首页
            wx.switchTab({
                url: '/pages/index/index'
            });
        }).catch(err => {
            console.error('验证手机号失败:', err);
            wx.showToast({
                title: '验证失败，请重试',
                icon: 'none'
            });
        });
    },

    inputCode(e) {
        this.setData({
            code: e.detail.value
        });
    },

    sendCode() {
        const {
            phone
        } = this.data;
        if (!phone || phone.length !== 11) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return;
        }
        

        // 开始倒计时
        this.setData({
            counting: true
        });

        let count = 60;
        const timer = setInterval(() => {
            count--;
            this.setData({
                countDown: count
            });
            if (count === 0) {
                clearInterval(timer);
                this.setData({
                    counting: false,
                    countDown: 60
                });
            }
        }, 1000);

        // TODO: 调用发送验证码接口
        request({
            url: '/user/sendCode',
            method: 'POST',
            data: {
                phone
            }
        }).then(res => {
            console.log(res);
            wx.showToast({
                title: '验证码已发送',
                icon: 'success'
            });
        }).catch(err => {
            console.error('发送验证码失败:', err);
            wx.showToast({
                title: '发送验证码失败，请重试',
                icon: 'none'
            });
        });
    },

    handleLogin() {
        const {
            phone,
            code
        } = this.data;
        if (!phone || phone.length !== 11) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return;
        }
        if (!code || code.length !== 6) {
            wx.showToast({
                title: '请输入正确的验证码',
                icon: 'none'
            });
            return;
        }
        const data = {
            phone,
            code
        }
        console.log(data);
        request({
            url: '/user/login',
            method: 'POST',
            data: data
        }).then(res => {
            wx.showLoading({
                title: '登录中...'
            });
            // 存储用户信息
            wx.setStorageSync('userInfo', {
                phone,
                isAdmin: false // 这里需要根据实际接口返回判断
            });

            // 根据用户角色跳转到不同页面
            const isAdmin = false; // 这里需要根据实际接口返回判断
            if (isAdmin) {
                wx.redirectTo({
                    url: '/pages/admin/dashboard/index'
                });
            } else {
                wx.switchTab({
                    url: '/pages/index/index'
                });
            }
        }).catch(err => {
            console.error('登录失败:', err);
            wx.hideLoading();
            wx.showToast({
                title: '登录失败，请重试',
                icon: 'none'
            });
        });
    }
})
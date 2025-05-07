import {changeUserName} from '../../api/setting'

Page({
    data: {
        userName:'',
        phone: '',
        code: '',
        counting: false,
        countDown: 60
    },
    inputUserName(e) {
        this.setData({
            userName: e.detail.value
        });
    },
    inputPhone(e) {
        this.setData({
            phone: e.detail.value
        });
    },
    inputCode(e) {
        this.setData({
            code: e.detail.value
        });
    },
    sendCode() {
        const { phone, counting } = this.data;
        if (counting) return;
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return;
        }
        this.setData({
            counting: true,
            countDown: 60
        });
        const timer = setInterval(() => {
            let { countDown } = this.data;
            countDown--;
            if (countDown > 0) {
                this.setData({
                    countDown
                });
            } else {
                clearInterval(timer);
                this.setData({
                    counting: false
                });
            }
        }, 1000);
        // 模拟发送验证码请求，实际使用时需要替换为真实接口
        wx.request({
            url: 'https://your-api-url/sendCode',
            method: 'POST',
            data: {
                phone
            },
            success(res) {
                if (res.statusCode === 200) {
                    wx.showToast({
                        title: '验证码发送成功',
                        icon: 'success'
                    });
                } else {
                    wx.showToast({
                        title: '验证码发送失败',
                        icon: 'error'
                    });
                }
            },
            fail(err) {
                console.error('发送验证码请求失败:', err);
                wx.showToast({
                    title: '网络错误，请稍后重试',
                    icon: 'error'
                });
            }
        });
    },
    handleLogin() {
        const { phone, code } = this.data;
        if (!phone) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            });
            return;
        }
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return;
        }
        if (code) {
            // 如果输入了验证码，进行手机号修改验证
            wx.request({
                url: 'https://your-api-url/modifyPhone',
                method: 'POST',
                data: {
                    phone,
                    code
                },
                success(res) {
                    if (res.statusCode === 200) {
                        wx.showToast({
                            title: '手机号修改成功',
                            icon: 'success'
                        });
                    } else {
                        wx.showToast({
                            title: '手机号修改失败',
                            icon: 'error'
                        });
                    }
                },
                fail(err) {
                    console.error('修改手机号请求失败:', err);
                    wx.showToast({
                        title: '网络错误，请稍后重试',
                        icon: 'error'
                    });
                }
            });
        } else {
            // 如果没有输入验证码，进行用户名修改验证
            wx.request({
                url: 'https://your-api-url/modifyUsername',
                method: 'POST',
                data: {
                    phone // 这里假设用手机号作为用户名
                },
                success(res) {
                    if (res.statusCode === 200) {
                        wx.showToast({
                            title: '用户名修改成功',
                            icon: 'success'
                        });
                    } else {
                        wx.showToast({
                            title: '用户名修改失败',
                            icon: 'error'
                        });
                    }
                },
                fail(err) {
                    console.error('修改用户名请求失败:', err);
                    wx.showToast({
                        title: '网络错误，请稍后重试',
                        icon: 'error'
                    });
                }
            });
        }
    },
    // 修改用户名
    handleUserName(){
        const userName = this.data.userName
        console.log(userName);
        if (userName) {
            changeUserName(userName).then(res => {
                // console.log(res);
                wx.showToast({
                    title: '用户名修改成功',
                    icon: 'success'
                });
            })
        } else {
            wx.showToast({
                title: '用户名修改失败',
                icon: 'error'
            });
        }
    }
});    
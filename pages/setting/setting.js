import {
    changeUserName,
    chengePhone
} from '../../api/setting'

Page({
    data: {
        userName: '',
        phone: ''
    },

    onLoad() {
        // 获取用户信息
        const name = wx.getStorageSync('name');
        const phone = wx.getStorageSync('phone');

        this.setData({
            userName: name || '',
            phone: phone || ''
        });
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

    handleChangePhone() {
        const {
            phone
        } = this.data;
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

        wx.showLoading({
            title: '修改中...',
        });

        chengePhone(phone).then(res => {
            console.log(res);
            wx.hideLoading();
            // 更新缓存
            wx.setStorageSync('phone', phone);
            wx.showToast({
                title: '手机号修改成功',
                icon: 'success'
            });
        }).catch(err => {
            wx.hideLoading();
            console.error('修改失败:', err);
            wx.showToast({
                title: '修改失败，请重试',
                icon: 'none'
            });
        });
    },

    handleUserName() {
        const {
            userName
        } = this.data;
        if (!userName.trim()) {
            wx.showToast({
                title: '请输入用户名',
                icon: 'none'
            });
            return;
        }

        wx.showLoading({
            title: '修改中...',
        });

        changeUserName(userName).then(res => {
            console.log(res);
            wx.hideLoading();
            // 更新缓存
            wx.setStorageSync('name', userName);
            wx.showToast({
                title: '用户名修改成功',
                icon: 'success'
            });
        }).catch(err => {
            wx.hideLoading();
            console.error('修改失败:', err);
            wx.showToast({
                title: '修改失败，请重试',
                icon: 'none'
            });
        });
    }
});
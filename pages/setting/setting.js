import {changeUserName} from '../../api/setting'
import {sendCode,wxLogin } from '../../api/login'


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
        sendCode(phone).then(res => {
            console.log(res);
        })
    },
    handleChangePhone() {
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
        const data = { phone, code }
        if (code) {
            console.log(data);
            // 如果输入了验证码，进行手机号修改验证
            wxLogin(data).then(res => {
                console.log(res);
            })
            
        } else {
            
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
import { request } from '../../api/request';
import { setupTabBar } from '../../utils/tabBar';

Page({
    data: {
        showPhoneVerify: false,
        phone: '',
        name: '',
        department: '',
        loginCode: '', // 保存登录code
        userId: '', // 保存用户ID
        departmentList: [
            '市本级', 
            '玄武区环境监察大队', 
            '秦淮区环境监察大队', 
            '建邺区环境监察大队', 
            '鼓楼区环境监察大队', 
            '浦口区生态环境综合行政执法局',
            '栖霞生态环境综合行政执法局',
            '雨花台生态环境综合行政执法局',
            '江宁区环境监察大队',
            '六合区环境监察大队',
            '溧水区生态环境综合行政执法局',
            '高淳区环境监察大队',
            '经济技术开发区环境监察大队',
            '江北新区环境监察大队',
            '生态环境监察执法研究所'
        ], // 部门列表
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
                        wx.setStorageSync('learnTime', res.learnTime);
                        
                        this.setData({
                            userId: res.userId
                        });
                        
                        // 设置tabBar显示
                        setupTabBar();
                        
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
                                        // 重新初始化tabBar
                                        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
                                            const role = wx.getStorageSync('role');
                                            const list = [
                                                {
                                                    pagePath: "/pages/index/index",
                                                    text: "首页",
                                                    iconPath: "/assets/icons/home.png",
                                                    selectedIconPath: "/assets/icons/home-active.png"
                                                },
                                                {
                                                    pagePath: "/pages/user-info/index",
                                                    text: "我的",
                                                    iconPath: "/assets/icons/user.png",
                                                    selectedIconPath: "/assets/icons/user-active.png"
                                                }
                                            ];
                                            
                                            if (role === 'admin') {
                                                list.push({
                                                    pagePath: "/pages/admin/dashboard/index",
                                                    text: "管理",
                                                    iconPath: "/assets/icons/admin.png",
                                                    selectedIconPath: "/assets/icons/admin-active.png"
                                                });
                                            }
                                            
                                            this.getTabBar().setData({
                                                selected: 0,
                                                list: list
                                            });
                                            // 更新tabBar显示
                                            this.getTabBar().updateTabBar();
                                        }
                                        wx.switchTab({
                                            url: '/pages/index/index'
                                        });
                                    }, 1500);
                                }
                            });
                        }
                    }).catch(err => {
                        wx.hideLoading();
                        console.error('登录失败:', err);
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
        const value = e.detail.value;
        // 只允许输入数字
        const phoneNumber = value.replace(/\D/g, '');
        // 限制长度为11位
        const limitedPhone = phoneNumber.slice(0, 11);
        
        this.setData({
            phone: limitedPhone
        });
    },

    // 姓名输入处理
    onNameInput(e) {
        const value = e.detail.value;
        // 去除首尾空格
        const trimmedValue = value.trim();
        // 限制长度为20个字符
        const limitedName = trimmedValue.slice(0, 20);
        
        this.setData({
            name: limitedName
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
    
    // 检查所有字段是否已填写
    checkAllFieldsFilled() {
        const { phone, name, department, userId } = this.data;
        
        const isPhoneValid = phone && phone.length === 11;
        const isNameValid = name && name.trim().length >= 2;
        const isDepartmentValid = department && department !== '';
        const isUserIdValid = userId && userId !== '';
        
        return isPhoneValid && isNameValid && isDepartmentValid && isUserIdValid;
    },

    // 验证手机号
    verifyPhone() {
        // 检查所有字段是否已填写
        if (!this.checkAllFieldsFilled()) {
            wx.showToast({
                title: '请完整填写所有信息',
                icon: 'none'
            });
            return;
        }
        
        const { phone, name, department, userId } = this.data;

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
        }).catch(err => {
            wx.hideLoading();
            console.error('提交失败:', err);
            wx.showToast({
                title: err,
                icon: 'none'
            });
        });
    }
});
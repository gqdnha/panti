import { request } from '../../api/request';
import { setupTabBar } from '../../utils/tabBar';
import { getApartmentList } from '../../api/apartmentAdmin'; // 与部门管理页面共用接口

Page({
    data: {
        showPhoneVerify: false,
        phone: '',
        name: '',
        department: '', // 选中的二级部门名称
        loginCode: '',
        userId: '',
        departmentList: [], // 仅存放二级部门名称
        departmentIndex: 0
    },

    onLoad() {
        // 页面加载时获取并提取二级部门列表
        this.getSecondLevelDepartments();
    },

    /**
     * 从后端获取数据并仅提取二级部门名称
     * 与部门管理页面保持一致的解析逻辑
     */
    getSecondLevelDepartments() {
        getApartmentList().then(res => {
            console.log("原始部门数据:", res);
            
            // 仅提取二级部门名称（与部门管理页面逻辑一致）
            const secondLevelDepts = [];
            
            // 假设后端返回格式：[{一级部门: [二级部门数组]}, ...]
            res.forEach(deptGroup => {
                for (const firstLevelName in deptGroup) {
                    if (deptGroup.hasOwnProperty(firstLevelName)) {
                        // 遍历二级部门数组，提取名称
                        const level2Depts = deptGroup[firstLevelName] || [];
                        level2Depts.forEach(level2 => {
                            // 确保二级部门名称唯一且不为空
                            if (level2.department && !secondLevelDepts.includes(level2.department)) {
                                secondLevelDepts.push(level2.department);
                            }
                        });
                    }
                }
            });

            console.log("提取的二级部门列表:", secondLevelDepts);
            
            this.setData({
                departmentList: secondLevelDepts,
                // 默认选中第一个二级部门（若存在）
                department: secondLevelDepts.length > 0 ? secondLevelDepts[0] : '',
                departmentIndex: 0
            });
        }).catch(err => {
            console.error("获取二级部门失败:", err);
            // 接口失败时使用默认二级部门兜底
            this.setData({
                departmentList: [
                    '高淳区生态环境综合行政执法局', 
                    '鼓楼区生态环境综合行政执法局'
                    // 仅保留典型二级部门
                ],
                department: '玄武区环境监察大队',
                departmentIndex: 0
            });
        });
    },

    /**
     * 微信一键登录（逻辑不变）
     */
    wxLogin() {
        wx.showLoading({ title: '登录中...' });

        wx.login({
            success: (res) => {
                if (res.code) {
                    this.setData({ loginCode: res.code });
                    
                    request({
                        url: '/user/login',
                        method: 'POST',
                        data: { code: res.code }
                    }).then(res => {
                        wx.hideLoading();
                        wx.setStorageSync('token', res.token);
                        wx.setStorageSync('userId', res.userId);
                        wx.setStorageSync('role', res.role);
                        this.setData({ userId: res.userId });
                        setupTabBar();

                        if (!res.phone || res.phone.trim() === '') {
                            // 回显用户已有部门（仅匹配二级部门）
                            let deptIndex = 0;
                            if (res.department && this.data.departmentList.length > 0) {
                                deptIndex = this.data.departmentList.indexOf(res.department);
                                deptIndex = deptIndex === -1 ? 0 : deptIndex;
                            }

                            this.setData({
                                showPhoneVerify: true,
                                name: res.name || '',
                                department: this.data.departmentList[deptIndex],
                                departmentIndex: deptIndex
                            });
                        } else {
                            wx.setStorageSync('name', res.name);
                            wx.setStorageSync('phone', res.phone);
                            wx.setStorageSync('department', res.department);
                            wx.showToast({
                                title: '登录成功',
                                icon: 'success',
                                duration: 1500,
                                success: () => setTimeout(() => {
                                    this.initTabBar();
                                    wx.switchTab({ url: '/pages/index/index' });
                                }, 1500)
                            });
                        }
                    }).catch(err => {
                        wx.hideLoading();
                        console.error('登录失败:', err);
                        wx.showToast({ title: '登录失败，请重试', icon: 'none' });
                    });
                } else {
                    wx.hideLoading();
                    wx.showToast({ title: '获取登录凭证失败', icon: 'none' });
                }
            },
            fail: (error) => {
                wx.hideLoading();
                console.error('wx.login失败:', error);
                wx.showToast({ title: '登录失败，请重试', icon: 'none' });
            }
        });
    },

    // 以下方法保持不变
    onPhoneInput(e) {
        const value = e.detail.value.replace(/\D/g, '');
        this.setData({ phone: value.slice(0, 11) });
    },

    onNameInput(e) {
        const value = e.detail.value.trim().slice(0, 20);
        this.setData({ name: value });
    },

    onDepartmentChange(e) {
        const index = e.detail.value;
        this.setData({
            department: this.data.departmentList[index],
            departmentIndex: index
        });
    },

    checkAllFieldsFilled() {
        const { phone, name, department, userId } = this.data;
        
        if (phone.length !== 11) {
            wx.showToast({ title: '请输入11位有效手机号', icon: 'none' });
            return false;
        }
        if (name.length < 2) {
            wx.showToast({ title: '请输入至少2个字符的姓名', icon: 'none' });
            return false;
        }
        if (!department) {
            wx.showToast({ title: '请选择部门', icon: 'none' });
            return false;
        }
        if (!userId) {
            wx.showToast({ title: '用户信息异常，请重新登录', icon: 'none' });
            return false;
        }
        return true;
    },

    verifyPhone() {
        if (!this.checkAllFieldsFilled()) return;

        const { phone, name, department, userId } = this.data;
        wx.showLoading({ title: '提交中...' });

        request({
            url: '/user/addUserInfo',
            method: 'POST',
            data: { userId, phone, name, department }
        }).then(res => {
            wx.hideLoading();
            wx.setStorageSync('name', name);
            wx.setStorageSync('phone', phone);
            wx.setStorageSync('department', department);
            
            wx.showToast({
                title: '信息提交成功',
                icon: 'success',
                duration: 1500,
                success: () => setTimeout(() => {
                    this.setData({ showPhoneVerify: false });
                    this.initTabBar();
                    wx.switchTab({ url: '/pages/index/index' });
                }, 1500)
            });
        }).catch(err => {
            wx.hideLoading();
            console.error('信息提交失败:', err);
            wx.showToast({ 
                title: err.msg || '提交失败，请重试', 
                icon: 'none' 
            });
        });
    },

    initTabBar() {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            const role = wx.getStorageSync('role');
            const tabBarList = [
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
                tabBarList.push({
                    pagePath: "/pages/admin/dashboard/index",
                    text: "管理",
                    iconPath: "/assets/icons/admin.png",
                    selectedIconPath: "/assets/icons/admin-active.png"
                });
            }
            this.getTabBar().setData({ selected: 0, list: tabBarList });
            this.getTabBar().updateTabBar();
        }
    }
});
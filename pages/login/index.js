import { request } from '../../api/request';
import { setupTabBar } from '../../utils/tabBar';

Page({
    data: {
        showPhoneVerify: false, // 控制信息完善弹窗显示
        phone: '',
        name: '',
        department: '',
        loginCode: '', // 微信登录code
        userId: '', // 用户ID
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
            '江北新区生态环境综合行政执法局',
            '生态环境监察执法研究所',
            '玄武区生态环境综合行政执法局',
            '秦淮区生态环境综合行政执法局'
        ],
        departmentIndex: 0 // 默认选中第一个部门
    },

    /**
     * 微信一键登录
     * 1. 获取微信登录code
     * 2. 调用后端登录接口
     * 3. 根据返回的phone字段判断是否显示完善信息弹窗
     */
    wxLogin() {
        wx.showLoading({ title: '登录中...' });

        wx.login({
            success: (res) => {
                if (res.code) {
                    this.setData({ loginCode: res.code });
                    
                    // 发送code到后端验证
                    request({
                        url: '/user/login',
                        method: 'POST',
                        data: { code: res.code }
                    }).then(res => {
                        wx.hideLoading();
                        // 保存基础用户信息到缓存
                        wx.setStorageSync('token', res.token);
                        wx.setStorageSync('userId', res.userId);
                        wx.setStorageSync('role', res.role);
                        wx.setStorageSync('learnTime', res.learnTime);
                        this.setData({ userId: res.userId });
                        setupTabBar();

                        // 核心逻辑：根据phone是否存在控制弹窗
                        if (!res.phone || res.phone.trim() === '') {
                            // 无手机号 → 显示完善信息弹窗
                            this.setData({
                                showPhoneVerify: true,
                                // 预填已有信息（如后端返回姓名/部门）
                                name: res.name || '',
                                department: res.department || this.data.departmentList[0],
                                departmentIndex: res.department 
                                    ? this.data.departmentList.indexOf(res.department) 
                                    : 0
                            });
                        } else {
                            // 有手机号 → 直接登录成功
                            wx.setStorageSync('name', res.name);
                            wx.setStorageSync('phone', res.phone);
                            wx.setStorageSync('department', res.department);
                            wx.showToast({
                                title: '登录成功',
                                icon: 'success',
                                duration: 1500,
                                success: () => setTimeout(() => {
                                    this.initTabBar(); // 初始化底部导航
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

    /**
     * 手机号输入处理
     * 仅允许输入数字，限制11位
     */
    onPhoneInput(e) {
        const value = e.detail.value.replace(/\D/g, ''); // 过滤非数字
        this.setData({ phone: value.slice(0, 11) }); // 限制长度
    },

    /**
     * 姓名输入处理
     * 去除首尾空格，限制20个字符
     */
    onNameInput(e) {
        const value = e.detail.value.trim().slice(0, 20);
        this.setData({ name: value });
    },

    /**
     * 部门选择处理
     */
    onDepartmentChange(e) {
        const index = e.detail.value;
        this.setData({
            department: this.data.departmentList[index],
            departmentIndex: index
        });
    },

    /**
     * 校验表单字段完整性
     * @returns {boolean} 字段是否全部有效
     */
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

    /**
     * 提交完善的用户信息
     */
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
            // 保存完善后的信息到缓存
            wx.setStorageSync('name', name);
            wx.setStorageSync('phone', phone);
            wx.setStorageSync('department', department);
            
            wx.showToast({
                title: '信息提交成功',
                icon: 'success',
                duration: 1500,
                success: () => setTimeout(() => {
                    this.setData({ showPhoneVerify: false }); // 关闭弹窗
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

    /**
     * 初始化底部导航栏（根据角色显示不同菜单）
     */
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
            // 管理员额外显示"管理"菜单
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
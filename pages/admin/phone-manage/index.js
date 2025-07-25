import {
    getphoneApi,
    addPhone,
    deletePhone,
} from '../../../api/admin-phone'

Page({
    data: {
        searchValue: '',
        phoneList: [],
        showEditModal: false,
        showAddModal: false,
        newPhone: '',
        currentId: null,
        pageNum: 1,
        pageSize: 10,
        total: 0,
        phoneNumber: ''
    },

    onLoad() {
        this.loadPhoneList();
    },

    // 加载手机号列表
    loadPhoneList() {
        const phone = this.data.phoneNumber
        // TODO: 调用后端API获取手机号列表
        getphoneApi(phone).then(res => {
            console.log(res);
            this.setData({
                phoneList: res
            })
        })
    },

    // 搜索输入
    onSearchInput(e) {
        this.setData({
            searchValue: e.detail.value
        });
    },

    // 搜索
    onSearch() {
        const searchValue = this.data.searchValue;
        console.log(searchValue);
        getphoneApi(searchValue).then(res => {
            console.log(res);
            this.setData({
                phoneList: res || []
            });
        }).catch(err => {
            console.error('搜索手机号失败:', err);
            wx.showToast({
                title: '搜索失败，请重试',
                icon: 'none'
            });
        });
    },

    // 显示新增弹窗
    showAddModal() {
        this.setData({
            showAddModal: true,
            newPhone: ''
        });
    },

    // 新手机号输入
    onNewPhoneInput(e) {
        this.setData({
            newPhone: e.detail.value
        });
    },
    // 取消新增
    cancelAdd() {
        this.setData({
            showAddModal: false,
            newPhone: ''
        });
    },
    // 确认新增
    confirmAdd() {
        const newPhone = this.data.newPhone
        if (!newPhone) {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none'
            });
            return;
        }

        // 调用后端API新增手机号
        console.log('新增手机号:', newPhone);
        addPhone(newPhone).then(res => {
            console.log(res);
            wx.showToast({
                title: '添加成功',
                icon: 'success'
            });
            this.setData({
                showAddModal: false,
                newPhone: ''
            }, () => {
                this.loadPhoneList();
            });
        }).catch(err => {
            console.error('添加手机号失败:', err);
            wx.showToast({
                title: err,
                icon: 'none'
            });
        });
    },

    // 删除手机号
    deletePhone(e) {
        const {
            id
        } = e.currentTarget.dataset;
        console.log(id);
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这个手机号吗？',
            success: (res) => {
                if (res.confirm) {
                    deletePhone(id).then(res => {
                        console.log(res);
                        wx.showToast({
                            title: '删除成功',
                            icon: 'success'
                        });
                        // 重新加载列表
                        this.loadPhoneList();
                    }).catch(err => {
                        console.error('删除手机号失败:', err);
                        wx.showToast({
                            title: '删除失败，请重试',
                            icon: 'none'
                        });
                    });
                }
            }
        });
    },
    // 下拉刷新
    onPullDownRefresh() {
        this.setData({
            pageNum: 1
        }, () => {
            this.loadPhoneList();
            wx.stopPullDownRefresh();
        });
    },

    // 上拉加载更多
    onReachBottom() {
        const {
            pageNum,
            pageSize,
            total
        } = this.data;
        if (pageNum * pageSize >= total) {
            return;
        }
        this.setData({
            pageNum: pageNum + 1
        }, () => {
            this.loadPhoneList();
        });
    }
});
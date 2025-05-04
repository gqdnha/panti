import {
    getLawsData
} from '../../api/getLaws'

Page({
    data: {
        // 法律分类
        regulationType: '',
        // 法律名
        regulationName: '',
        // 文件路径
        files: '',
        fileName: '',
        isAddModalVisible: false,
        // 法律列表数据
        lawList: [],
        pageNum: 1,
        totalPages: 1,
        pageSize: 10
    },

    onLoad(options) {
        this.loadLaws();
    },

    // 加载法律列表
    loadLaws() {
        const {
            pageNum,
            pageSize
        } = this.data;
        const data = {
            regulationName: "",
            pageNum: pageNum,
            pageSize: pageSize
        };
        console.log(data);
        getLawsData(data).then(res => {
            console.log(res);
            this.setData({
                lawList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage
            });
            console.log(this.data.lawList);
        }).catch(err => {
            console.error(err);
        });
    },

    // 查看详情
    lookDetil(e) {
        const lawId = e.currentTarget.dataset.id;
        const lawItem = this.data.lawList.find(item => item.id === lawId);
        if (lawItem) {
            wx.navigateTo({
                url: `/pages/resources/detail/index?id=${lawId}&name=${lawItem.regulation_name}&type=${lawItem.regulation_type}`
            });
        }
    },

    onNextPage() {
        const {
            pageNum,
            totalPages
        } = this.data;
        if (pageNum < totalPages) {
            this.setData({
                pageNum: pageNum + 1
            });
            this.loadLaws();
        } else {
            wx.showToast({
                title: '已经是最后一页了',
                icon: 'none'
            });
        }
    },

    onPreviousPage() {
        const {
            pageNum
        } = this.data;
        if (pageNum > 1) {
            this.setData({
                pageNum: pageNum - 1
            });
            this.loadLaws();
        } else {
            wx.showToast({
                title: '已经是第一页了',
                icon: 'none'
            });
        }
    }
});
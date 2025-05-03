import {
    getLawsData
} from '../../api/getLaws'

Page({

    data: {
        totalPages:0,
        lawList:[],
        pageNum:1,
        pageSize:10
    },

    onLoad(options) {
        this.loadLaws()
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
            // 假设 res 包含 userList 和 totalPages 数据
            this.setData({
                lawList: res.pageInfo.pageData,
                totalPages: res.pageInfo.totalPage
            });
        }).catch(err => {
            console.error(err);
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },


})
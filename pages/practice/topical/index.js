import {getAllQuestion} from "../../../api/getAllQuestion";

Page({
    data: {
        eh: '简单', 
        currentCategories: [],
        categoryStatus: {},
    },
    onLoad() {
        this.setData({
            currentCategories: []
        });
        this.initCategoryStatus();
        this.getAllData();
    },
    // 获取后端数据
    getAllData: async function() {
        try {
            const res = await getAllQuestion({ eh: this.data.eh });
            console.log(res); 
            this.setData({
                currentCategories : res.pageInfo.pageData
            })
            console.log(this.data.currentCategories);
            // console.log(this.data.currentCategories.pageInfo.pageData);
        } catch (error) {
            console.error('获取问题数据失败:', error);
        }

    },
    changeLevel: function (e) {
        const newEh = e.currentTarget.dataset.eh;
        this.setData({
            eh: newEh
        });
        this.getAllData();
    },
    initCategoryStatus() {
        const statusObj = {};
        this.data.currentCategories.forEach(item => {
            statusObj[item.id] = '0/0题';
        });
        this.setData({
            categoryStatus: statusObj
        });
    },
    goToPracticePage(e) {
        const categoryId = e.currentTarget.dataset.categoryId;
        console.log('点击分类练习，categoryId:', categoryId);
        wx.navigateTo({
            url: `pages/practice/topical/index?categoryId=${categoryId}&eh=${this.data.eh}`
        });
    }
});    
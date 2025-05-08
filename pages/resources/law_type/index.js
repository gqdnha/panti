
Page({
    data: {
        questionList: [],
        totalPages: 0,
        currentCategories: [
            {
                id: 1,
                category: '法律'
            },
            {
                id: 2,
                category: '行政法规'
            },
            {
                id: 3,
                category: '地方性法规'
            },
            {
                id: 4,
                category: '规章'
            },
            {
                id: 5,
                category: '标准与规范'
            },
            {
                id: 6,
                category: '制度与政策'
            },
            {
                id: 7,
                category: '其他'
            },
        ],
    },
    goToPracticePage(e) {
        const category = e.currentTarget.dataset.category;
        console.log('点击分类练习，category:', category);
        wx.navigateTo({
            url: `/pages/resources/detail/index?category=${encodeURIComponent(category)}`
        });
    }
});
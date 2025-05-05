
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
                category: '大气'
            },
            {
                id: 3,
                category: '科学'
            },
            {
                id: 4,
                category: '技术'
            },
            {
                id: 5,
                category: '艺术'
            },
            {
                id: 6,
                category: '体育'
            },
            {
                id: 7,
                category: '娱乐'
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

Page({
    data: {
        questionList: [],
        totalPages: 0,
        currentCategories: [
            {
                id: 1,
                category: '环境保护法及配套办法'
            },
            {
                id: 2,
                category: '环评与排污许可执法'
            },
            {
                id: 3,
                category: '大气污染防治执法'
            },
            {
                id: 4,
                category: '水污染防治执法'
            },
            {
                id: 5,
                category: '固废污染防治执法'
            },
            {
                id: 6,
                category: '土壤污染防治执法'
            },
            {
                id: 7,
                category: '噪声污染执法'
            },
            {
                id: 8,
                category: '执法监测'
            },
            {
                id: 9,
                category: '行政执法规定'
            },
            {
                id: 10,
                category: '行刑衔接与损害赔偿'
            },
            {
                id: 11,
                category: '其他'
            },
        ],
    },
    goToPracticePage(e) {
        const category = e.currentTarget.dataset.category;
        console.log('点击分类练习，category:', category);
        wx.navigateTo({
            url: `/pages/practice/topcical_type/topical_type?category=${encodeURIComponent(category)}`
        });
    }
});

Page({
    data: {
        questionList: [],
        totalPages: 0,
        currentCategories: [
            {
                id: 1,
                imgUrl:'/assets/topical/环境保护税基础信息采集.png',
                category: '环境保护法及配套办法'
            },
            {
                id: 2,
                imgUrl:'/assets/topical/环评与排污许可执法.png',
                category: '环评与排污许可执法'
            },
            {
                id: 3,
                imgUrl:'/assets/topical/大气污染防治执法.png',
                category: '大气污染防治执法'
            },
            {
                id: 4,
                imgUrl:'/assets/topical/水污染防治执法.png',
                category: '水污染防治执法'
            },
            {
                id: 5,
                imgUrl:'/assets/topical/固废污染防治执法.png',
                category: '固废污染防治执法'
            },
            {
                id: 6,
                imgUrl:'/assets/topical/土壤污染防治执法.png',
                category: '土壤污染防治执法'
            },
            {
                id: 7,
                imgUrl:'/assets/topical/噪声污染执法.png',
                category: '噪声污染执法'
            },
            {
                id: 8,
                imgUrl:'/assets/topical/执法监测.png',
                category: '执法监测'
            },
            {
                id: 9,
                imgUrl:'/assets/topical/行政执法规定.png',
                category: '行政执法规定'
            },
            {
                id: 10,
                imgUrl:'/assets/topical/行刑衔接与损害赔偿.png',
                category: '行刑衔接与损害赔偿'
            },
            {
                id: 11,
                imgUrl:'/assets/topical/其他.png',
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
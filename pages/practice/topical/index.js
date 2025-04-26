Page({
    data: {
        time: '08:55',
        level: '中级',
        allCategories: {
            初级: [
                {
                    id: 1,
                    name: '初级基础知识',
                    icon: 'path/to/primary_icon1.png'
                },
                {
                    id: 2,
                    name: '初级水与废水',
                    icon: 'path/to/primary_icon2.png'
                }
            ],
            中级: [
                {
                    id: 1,
                    name: '中级基础知识',
                    icon: 'path/to/intermediate_icon1.png'
                },
                {
                    id: 2,
                    name: '中级水与废水',
                    icon: 'path/to/intermediate_icon2.png'
                }
            ],
            '2025年能力提升': [
                {
                    id: 1,
                    name: '2025知识提升',
                    icon: 'path/to/2025_icon1.png'
                },
                {
                    id: 2,
                    name: '2025技能提升',
                    icon: 'path/to/2025_icon2.png'
                }
            ]
        },
        currentCategories: [],
        categoryStatus: {},
        comprehensiveStatus: '15题/15分钟',
        comprehensiveIcon: 'path/to/comprehensiveIcon.png'
    },
    onLoad() {
        this.setData({
            currentCategories: this.data.allCategories[this.data.level]
        });
        this.initCategoryStatus();
        // 模拟从后端获取数据
        this.fetchCategoryStatus();
    },
    changeLevel: function (e) {
        const newLevel = e.currentTarget.dataset.level;
        this.setData({
            level: newLevel,
            currentCategories: this.data.allCategories[newLevel]
        });
        this.initCategoryStatus();
        // 切换级别后重新获取对应级别的状态数据
        this.fetchCategoryStatus();
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
    fetchCategoryStatus() {
        // 这里使用 wx.request 模拟从后端获取数据
        // 实际使用时，需要替换为真实的后端接口地址
        wx.request({
            url: 'https://example.com/api/categoryStatus',
            method: 'GET',
            data: {
                level: this.data.level
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    const formattedStatus = {};
                    for (const [key, value] of Object.entries(res.data)) {
                        formattedStatus[key] = `${value}/0题`;
                    }
                    this.setData({
                        categoryStatus: formattedStatus
                    });
                }
            },
            fail: (err) => {
                console.error('获取分类状态数据失败:', err);
            }
        });
    },
    goToPracticePage(e) {
        const categoryId = e.currentTarget.dataset.categoryId;
        console.log('11');
        // 这里需要替换为实际的练习页面路径
        wx.navigateTo({
            // url: `pages/practice/topical/topicalAnswer/topicalAnswer?categoryId=${categoryId}&level=${this.data.level}`
        });
    },
});    
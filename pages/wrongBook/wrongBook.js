
Page({
    data: {
        questionList: [],
        totalPages: 0,
        currentTypes: [
            {
                id: 1,
                type: '单选题'
            },
            {
                id: 2,
                type: '多选题'
            },
            {
                id: 3,
                type: '判断题'
            },
            {
                id: 4,
                type: '填空题'
            },
            
        ],
    },
    goToPracticePage(e) {
        const type = e.currentTarget.dataset.type;
        console.log('type:', type);
        wx.navigateTo({
            url: `/pages/wrongBook_type/wrongBook_type?type=${encodeURIComponent(type)}`
        });
    }
});
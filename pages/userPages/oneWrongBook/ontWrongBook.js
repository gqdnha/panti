
Page({
    data: {
        userId:0,
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
    onLoad(options) {
        const id = options.id
        const userId = parseInt(id)
        this.setData({
            userId:userId
        })
        console.log(this.data.userId);
    },
    goToPracticePage(e) {
        const type = e.currentTarget.dataset.type;
        const userId = this.data.userId
        wx.navigateTo({
            url: `/pages/userPages/oneWrongBook_type/ontWrongBook_type?userId=${encodeURIComponent(userId)}&type=${encodeURIComponent(type)}`
        });
    }
});
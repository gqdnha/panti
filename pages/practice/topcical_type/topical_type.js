// pages/practice/topical_type/topical_type.js
Page({
    data: {
        category: '',
        questionTypes: ['单选', '多选', '填空']
    },
    onLoad(options) {
        const category = decodeURIComponent(options.category);
        this.setData({
            category
        });
        console.log('接收到的类别:', category);
    },
    goToQuestionPage(e) {
        const questionType = e.currentTarget.dataset.type;
        const { category } = this.data;
        console.log('点击题目类型，category:', category, 'questionType:', questionType);
        // 这里可以跳转到展示题目的页面，并传递类别和题目类型信息
        wx.navigateTo({
            /* url: `/pages/practice/questions/questions?category=${encodeURIComponent(category)}&questionType=${encodeURIComponent(questionType)}` */
            url: `/pages/practice/topical_question/topical_question?category=${encodeURIComponent(category)}&questionType=${encodeURIComponent(questionType)}`
        });
    }
});


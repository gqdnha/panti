import {
    apiGetoneDailyTest
} from "../../../api/getDailyTest";

Page({
    data: {
        userId: 0,
        // 页面数据
        currentQuestion: 1, //题目序号
        totalQuestions: 0, //总数
        allQuestions: [], //所有题目
        hasData: true, // 是否有数据
        isLoading: true // 是否正在加载
    },
    onLoad: function (options) {
        const id = options.id
        const userId = parseInt(id)
        this.setData({
            userId: userId
        })
        console.log(this.data.userId);
        this.getData()
    },
    // 请求接口
    getData() {
        const userId = this.data.userId
        console.log(userId);
        this.setData({ isLoading: true });

        apiGetoneDailyTest(userId).then(res => {
            console.log('跳转个人daily：', res);

            // 检查是否有数据
            if (!res || res.length === 0) {
                this.setData({
                    isLoading: false,
                    hasData: false,
                    allQuestions: [],
                    totalQuestions: 0
                });
                return;
            }

            res.forEach(question => {
                if (question.options && typeof question.options === 'string') {
                    try {
                        question.options = JSON.parse(question.options)
                    } catch (error) {
                        console.log('选项解析错误：', error);
                        question.options = []
                    }
                }
            });

            this.setData({
                allQuestions: res,
                totalQuestions: res.length,
                isLoading: false,
                hasData: true
            }, () => {
                console.log('初始化完成：', {
                    totalQuestions: this.data.totalQuestions,
                    firstQuestionOptions: this.data.allQuestions[0]?.options
                });
            });
        }).catch(error => {
            console.error('获取数据失败：', error);
            this.setData({
                isLoading: false,
                hasData: false,
                allQuestions: [],
                totalQuestions: 0
            });
            wx.showToast({
                title: '获取数据失败，请重试',
                icon: 'none',
                duration: 2000
            });
        });
    },
    nextQuestion: function () {
        const { currentQuestion, totalQuestions } = this.data;
        if (currentQuestion < totalQuestions) {
            this.setData({
                currentQuestion: currentQuestion + 1
            });
        }
    },
    prevQuestion: function () {
        const { currentQuestion } = this.data;
        if (currentQuestion > 1) {
            this.setData({
                currentQuestion: currentQuestion - 1
            });
        }
    }
})
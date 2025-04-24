// pages/stats/answer-stats/index.js
import * as echarts from '../../../components/ec-canvas/echarts';
const { mockStats } = require('../../../data/stats');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentDate: '',
    totalTime: 0,
    correctRate: 0,
    wrongCount: 0,
    timeRange: 'week',
    questionTypes: ['全部', ...mockStats.questionTypes],
    selectedType: 0,
    knowledgePoints: ['全部', ...mockStats.knowledgePoints],
    selectedPoint: 0,
    wrongQuestions: [],
    ec: {
      lazyLoad: true
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.initData();
    this.loadWrongQuestions();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.initChart();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 初始化数据
  initData() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    this.setData({
      currentDate: dateStr
    });

    // 从虚拟数据获取统计数据
    const currentMonthStats = mockStats.monthlyStats[dateStr] || {
      totalTime: 0,
      correctRate: 0,
      wrongCount: 0
    };

    this.setData({
      totalTime: currentMonthStats.totalTime,
      correctRate: currentMonthStats.correctRate,
      wrongCount: currentMonthStats.wrongCount
    });
  },

  // 初始化图表
  initChart() {
    this.ecComponent = this.selectComponent('#correctRateChart');
    this.ecComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      this.setChartOption(chart);
      return chart;
    });
  },

  // 设置图表配置
  setChartOption(chart) {
    const currentMonthStats = mockStats.monthlyStats[this.data.currentDate];
    const dailyStats = currentMonthStats ? currentMonthStats.dailyStats : {};
    
    const dates = Object.keys(dailyStats).sort();
    const correctRates = dates.map(date => dailyStats[date].correctRate);

    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: dates.map(date => date.split('-')[2]), // 只显示日期
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666',
          formatter: '{value}%'
        }
      },
      series: [{
        data: correctRates,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#0066cc'
        },
        lineStyle: {
          color: '#0066cc',
          width: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgba(0, 102, 204, 0.3)'
          }, {
            offset: 1,
            color: 'rgba(0, 102, 204, 0.1)'
          }])
        }
      }]
    };

    chart.setOption(option);
  },

  // 切换时间范围
  switchTimeRange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      timeRange: range
    });
    this.initChart();
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      currentDate: e.detail.value
    });
    this.initData();
    this.loadWrongQuestions();
  },

  // 题型选择
  onTypeChange(e) {
    this.setData({
      selectedType: e.detail.value
    });
    this.loadWrongQuestions();
  },

  // 知识点选择
  onPointChange(e) {
    this.setData({
      selectedPoint: e.detail.value
    });
    this.loadWrongQuestions();
  },

  // 加载错题
  loadWrongQuestions() {
    let filteredQuestions = [...mockStats.wrongQuestions];

    // 按题型筛选
    if (this.data.selectedType > 0) {
      const selectedType = this.data.questionTypes[this.data.selectedType];
      filteredQuestions = filteredQuestions.filter(q => q.type === selectedType);
    }

    // 按知识点筛选
    if (this.data.selectedPoint > 0) {
      const selectedPoint = this.data.knowledgePoints[this.data.selectedPoint];
      filteredQuestions = filteredQuestions.filter(q => q.knowledgePoint === selectedPoint);
    }

    this.setData({
      wrongQuestions: filteredQuestions
    });
  },

  // 跳转到题目
  goToQuestion(e) {
    const id = e.currentTarget.dataset.id;
    const question = this.data.wrongQuestions.find(q => q.id === id);
    
    if (question) {
      // 保存练习题目到本地存储
      wx.setStorageSync('currentPractice', {
        questions: [question],
        mode: 'wrong',
        startTime: new Date().getTime()
      });

      wx.navigateTo({
        url: '/pages/practice/question/index'
      });
    }
  },

  // 开始错题强化
  startPractice() {
    if (this.data.wrongQuestions.length === 0) {
      wx.showToast({
        title: '暂无错题',
        icon: 'none'
      });
      return;
    }

    // 保存练习题目到本地存储
    wx.setStorageSync('currentPractice', {
      questions: this.data.wrongQuestions,
      mode: 'wrong',
      startTime: new Date().getTime()
    });

    wx.navigateTo({
      url: '/pages/practice/question/index'
    });
  }
})
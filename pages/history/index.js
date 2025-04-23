Page({
  data: {
    totalCount: 0,
    averageScore: 0,
    records: [],
    showFilter: false,
    startDate: '',
    endDate: '',
    selectedTypes: []
  },

  onLoad() {
    this.getHistoryData();
  },

  onPullDownRefresh() {
    this.getHistoryData();
    wx.stopPullDownRefresh();
  },

  getHistoryData() {
    // TODO: 从服务器获取历史数据
    // 这里使用模拟数据
    const records = [
      {
        id: 1,
        title: 'JavaScript基础测试',
        time: '2024-03-20 14:30',
        questionCount: 20,
        correctRate: 90,
        duration: 30,
        status: 'completed'
      },
      {
        id: 2,
        title: 'Vue.js进阶测试',
        time: '2024-03-19 16:45',
        questionCount: 15,
        correctRate: 85,
        duration: 25,
        status: 'completed'
      },
      {
        id: 3,
        title: 'React基础测试',
        time: '2024-03-18 10:20',
        questionCount: 25,
        correctRate: 80,
        duration: 35,
        status: 'in-progress'
      }
    ];

    // 计算统计数据
    const totalCount = records.length;
    const averageScore = records.reduce((sum, record) => sum + record.correctRate, 0) / totalCount;

    this.setData({
      records,
      totalCount,
      averageScore: Math.round(averageScore)
    });
  },

  showFilter() {
    this.setData({
      showFilter: true
    });
  },

  hideFilter() {
    this.setData({
      showFilter: false
    });
  },

  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    });
  },

  onEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    });
  },

  toggleType(e) {
    const { type } = e.currentTarget.dataset;
    const { selectedTypes } = this.data;
    const index = selectedTypes.indexOf(type);

    if (index > -1) {
      selectedTypes.splice(index, 1);
    } else {
      selectedTypes.push(type);
    }

    this.setData({
      selectedTypes
    });
  },

  resetFilter() {
    this.setData({
      startDate: '',
      endDate: '',
      selectedTypes: []
    });
  },

  confirmFilter() {
    // TODO: 根据筛选条件获取数据
    this.hideFilter();
    this.getHistoryData();
  },

  viewDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/history-detail/index?id=${id}`
    });
  }
}); 
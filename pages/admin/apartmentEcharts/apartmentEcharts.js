// 1、引入脚本
// import * as echarts from '../../ec-canvas/echarts';
import * as echarts from '../../../components/ec-canvas/echarts';
 
Page({
  data: {
    ec: {
      lazyLoad: true // 懒加载
    }
  },
  //button绑定事件----动态修改表的内容,和初始化一样
  change(){
    let data = [2, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.initchart(data);
  },
 
  loadchart(data){
    // 绑定组件（ec-canvas标签的id）
    let ec_canvas = this.selectComponent('#myChart');
    ec_canvas.init((canvas,width,height,dpr)=>{
      const chart =echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // 解决模糊显示的问题
      })
      // echart表格的内容配置
      var myoption = {
        title: {},
        tooltip: {
          trigger: 'axis'
        },
        legend: {},
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} '
          }
        },
        series: [
          {
            name: 'price',
            type: 'line',
            data: data, // 动态修改的数据
            markPoint: {
              data: [
                { type: 'max', name: 'Max' },
                { type: 'min', name: 'Min' }
              ]
            }
          }
        ]
      }
      chart.setOption(myoption);
      return chart;
    })
  },
  initchart(data){
    // 传递后台数据到图表中，进行懒加载图表
    this.loadchart(data);
  },
 
  onLoad: function (options) {
    //模拟后台数据初始化
    let data = [1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.initchart(data);
  },
})

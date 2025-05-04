import { getLawsData } from '../../';
import { baseURL } from '../../../api/request';

Page({
    data: {
        lawId: '',
        lawName: '',
        lawType: '',
        content: '',
        loading: true
    },

    onLoad(options) {
        const { id, name, type } = options;
        this.setData({
            lawId: id,
            lawName: name,
            lawType: type
        });
        this.loadLawContent();
    },

    // 加载法律内容
    loadLawContent() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });

        wx.request({
            url: `${baseURL}/regulation/getContent/${this.data.lawId}`,
            method: 'GET',
            success: (res) => {
                if (res.data.code === 200) {
                    this.setData({
                        content: res.data.data,
                        loading: false
                    });
                } else {
                    wx.showToast({
                        title: '获取内容失败',
                        icon: 'none'
                    });
                }
            },
            fail: (error) => {
                console.error('获取法律内容失败:', error);
                wx.showToast({
                    title: '获取内容失败',
                    icon: 'none'
                });
            },
            complete: () => {
                wx.hideLoading();
            }
        });
    },

    // 下载文件
    downloadFile() {
        wx.showLoading({
            title: '下载中...',
            mask: true
        });

        wx.downloadFile({
            url: `${baseURL}/regulation/download/${this.data.lawId}`,
            success: (res) => {
                if (res.statusCode === 200) {
                    // 打开文件
                    wx.openDocument({
                        filePath: res.tempFilePath,
                        success: function() {
                            console.log('打开文档成功');
                        },
                        fail: function(error) {
                            console.error('打开文档失败:', error);
                            wx.showToast({
                                title: '打开文件失败',
                                icon: 'none'
                            });
                        }
                    });
                }
            },
            fail: (error) => {
                console.error('下载文件失败:', error);
                wx.showToast({
                    title: '下载失败',
                    icon: 'none'
                });
            },
            complete: () => {
                wx.hideLoading();
            }
        });
    }
}); 
import {
    getLawsData
} from '../../../api/getLaws';
import {
    baseURL
} from '../../../api/request'
Page({
    data: {
        // 法律类型
        regulationType: '',
        pageNum: 1,
        pageSize: 10,
        totalSize: 0,
        totalPages: 0,
        lawList: [],
        isLoading: false,
        hasData: true,
        isFirstLoad: true
    },

    onLoad(options) {
        const regulationType = decodeURIComponent(options.category);
        console.log('列表', regulationType);
        this.setData({
            regulationType: regulationType
        });
        this.getLawsData();
    },
    getLawsData() {
        if (this.data.isLoading) return;
        this.setData({ isLoading: true });
        const regulationType = this.data.regulationType;
        const {
            pageNum,
            pageSize
        } = this.data;
        const fromData = {
            regulationType,
            pageNum,
            pageSize
        };
        console.log(regulationType);
        getLawsData(fromData).then(res => {
            console.log(res);
            const totalSize = res.pageInfo.totalSize;
            const totalPages = Math.ceil(totalSize / pageSize);
            const newData = res.pageInfo.pageData || [];
            const updatedLawList = this.data.lawList.concat(newData);
            
            this.setData({
                totalSize: totalSize,
                totalPages: totalPages,
                lawList: updatedLawList,
                isLoading: false,
                hasData: updatedLawList.length > 0,
                isFirstLoad: false
            });

            if (this.data.pageNum === 1 && updatedLawList.length === 0) {
                wx.showToast({
                    title: '该分类下暂无数据',
                    icon: 'none',
                    duration: 2000
                });
            }
        }).catch((error) => {
            console.error('获取数据失败：', error);
            this.setData({ 
                isLoading: false,
                hasData: this.data.lawList.length > 0,
                isFirstLoad: false
            });
            
            if (this.data.pageNum === 1) {
                wx.showToast({
                    title: '获取数据失败，请重试',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },
    openFile(e) {
        const index = e.currentTarget.dataset.index;
        const fileInfo = this.data.lawList[index];
        console.log(fileInfo);
        const baseurl = baseURL;
        console.log(baseurl);
        const fullFileUrl = baseurl + '/static/' + fileInfo.regulation_url;
        console.log(fullFileUrl);
        wx.downloadFile({
            url: fullFileUrl,
            success: (res) => {
                if (res.statusCode === 200) {
                    let fileType = 'pdf';
                    if (fileInfo.regulation_url.toLowerCase().endsWith('.docx')) {
                        fileType = 'docx';
                    } else if (fileInfo.regulation_url.toLowerCase().endsWith('.doc')) {
                        fileType = 'doc';
                    }
                    wx.openDocument({
                        filePath: res.tempFilePath,
                        fileType: fileType,
                        showMenu: true,
                        success: () => {
                            wx.showToast({
                                title: '打开文档成功',
                            });
                        },
                        fail: () => {
                            wx.showToast({
                                title: '打开文档失败',
                            });
                        },
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    title: '下载文档失败',
                });
            },
        });
    },
    onNextPage() {
        const { pageNum, totalPages } = this.data;
        if (pageNum < totalPages) {
            this.setData({ pageNum: pageNum + 1 });
            this.getLawsData();
        } else {
            wx.showToast({
                title: '已经是最后一页了',
                icon: 'none'
            });
        }
    },

    onPreviousPage() {
        const { pageNum } = this.data;
        if (pageNum > 1) {
            this.setData({ pageNum: pageNum - 1 });
            this.getLawsData();
        } else {
            wx.showToast({
                title: '已经是第一页了',
                icon: 'none'
            });
        }
    }
});    
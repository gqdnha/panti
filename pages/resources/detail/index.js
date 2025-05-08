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
        isLoading: false
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
            this.setData({
                totalSize: totalSize,
                totalPages: totalPages,
                lawList: this.data.lawList.concat(res.pageInfo.pageData),
                isLoading: false
            });
        }).catch(() => {
            this.setData({ isLoading: false });
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
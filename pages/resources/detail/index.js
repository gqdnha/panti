import { getLawsData } from '../../../api/getLaws';
import {baseURL} from '../../../api/request'
Page({
    data: {
        // 法律类型
        regulationType:'',
        pageNum:1,
        pageSize:10,
        totalSizeL:0,
        lawList:[],

    },

    onLoad(options) {
        const regulationType = decodeURIComponent(options.category);
        console.log('列表',regulationType);
        this.setData({
            regulationType:regulationType
        });
        this.getLawsData()
    },
    getLawsData() {
        const regulationType = this.data.regulationType
        const {pageNum,pageSize} = this.data
        const fromData = {
            regulationType,
            pageNum,
            pageSize
        }
        console.log(regulationType);
        getLawsData(fromData).then(res => {
            console.log(res);
            this.setData({
                totalSize:res.pageInfo.totalSize,
                lawList: res.pageInfo.pageData
            })
            // console.log(this.data.totalSize,'111');
            // console.log(this.data.lawList,'222');
        })
    },
        openFile(e) {
            const index = e.currentTarget.dataset.index;
            const fileInfo = this.data.lawList[index];
            console.log(fileInfo);
            // 假设完整的文件访问地址是通过拼接服务器地址和 regulation_url 得到的，这里假设服务器地址为 'https://yourserver.com/files/'
            // const fullFileUrl = {baseURL} + '/static/' + fileInfo.regulation_url; 
            const baseurl =baseURL
            console.log(baseurl);
            const fullFileUrl =  baseurl + '/static/'+ fileInfo.regulation_url
            console.log(fullFileUrl);
            wx.downloadFile({
                url: fullFileUrl,
                success: (res) => {
                    if (res.statusCode === 200) {
                        let fileType = 'pdf';
                        // 根据文件名后缀判断文件类型
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
}); 

    

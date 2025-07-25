import {
    getApartmentList,
    downLoadUserText,disableDepartment,grantDepartment
} from '../../../api/apartmentAdmin'
import {baseURL} from '../../../api/request'

Page({
    data: {
        searchKeyword: '',
        departments: [],
        allDepartments: []
    },

    onLoad() {
        this.getApartmentListApi()
    },
    // 页面加载时获取部门列表

    getApartmentListApi() {
        getApartmentList().then(res => {
            console.log(res);
            // 假设res为部门数组，字段有id、name、active
            this.setData({
                departments: res
            });
            console.log(this.data.departments);
        });
    },

    // 切换部门启用/停用状态（保持不变）
    toggleDeptStatus(e) {
        const department = e.currentTarget.dataset.department;
        console.log(department);
        const dept = this.data.departments.find(d => d.department === department);
        console.log(dept.isActive);
        if (!dept) return;

        const departmentName = dept.department; // 你的接口需要 department 字段
        console.log(departmentName);
        const isActive = dept.isActive;
        console.log(isActive);

        // 选择接口
        const apiCall = isActive ? grantDepartment : disableDepartment;

        wx.showLoading({ title: '操作中...' });
        apiCall(departmentName)
            .then(res => {
                console.log(res);
                // 0代表已授权 1代表已禁用
                console.log(departmentName);
                wx.hideLoading();
                this.getApartmentListApi()
                wx.showToast({ title: isActive ? '已启用' : '已停用' });
            })
            .catch(err => {
                wx.hideLoading();
                wx.showToast({ title: '网络错误', icon: 'none' });
            });
    },

    // 新增：导出部门数据（核心功能）
    exportDept(e) {
        // 获取当前部门名称
        const department = e.currentTarget.dataset.name;
        if (!department) {
            wx.showToast({ title: '未找到部门名称', icon: 'none' });
            return;
        }
    
        // 构造请求参数（后端要求数组格式）
        const data = [department];
        console.log(`导出部门：${department}，请求参数：`, data);
    
        // 接口地址
        const url = `${baseURL}/exportUserExcel`;
        console.log('导出接口URL：', url);
    
        wx.showLoading({ title: '导出中...' });
    
        // 发起POST请求（关键：指定 responseType 为 arraybuffer）
        wx.request({
            url: url,
            method: 'POST',
            data: data,
            header: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${wx.getStorageSync("gs-token")}` // 携带token
            },
            responseType: 'arraybuffer', // 必须指定，接收二进制流
            timeout: 30000, // 延长超时时间（文件导出可能较慢）
            success: (res) => {
                wx.hideLoading();
                console.log('导出接口响应状态码：', res.statusCode);
                
                // 验证响应是否为有效的Excel文件
                if (res.statusCode === 200) {
                    // Excel文件以PK开头（Zip压缩格式标识）
                    const uint8Array = new Uint8Array(res.data);
                    const isExcel = uint8Array.length > 2 && uint8Array[0] === 80 && uint8Array[1] === 75;
    
                    if (isExcel) {
                        // 保存文件到本地
                        this.saveExcelFile(res.data, `${department}.xlsx`);
                    } else {
                        // 若后端返回JSON错误信息（如无权限），尝试解析
                        try {
                            const errorMsg = JSON.parse(String.fromCharCode.apply(null, uint8Array)).message;
                            wx.showToast({ title: errorMsg || '导出失败', icon: 'none' });
                        } catch (e) {
                            wx.showToast({ title: '导出文件格式错误', icon: 'none' });
                        }
                    }
                } else {
                    wx.showToast({ title: `导出失败，状态码：${res.statusCode}`, icon: 'none' });
                }
            },
            fail: (err) => {
                wx.hideLoading();
                console.error('导出请求失败：', err);
                wx.showToast({ title: '网络错误，导出失败', icon: 'none' });
            }
        });
    },
    
    // 保存Excel文件到本地并提供打开选项
    saveExcelFile(arrayBuffer, fileName) {
        // 获取小程序本地文件系统管理器
        const fs = wx.getFileSystemManager();
        // 生成保存路径（小程序沙箱路径）
        const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
    
        try {
            // 写入二进制数据到本地文件
            fs.writeFileSync(filePath, arrayBuffer, 'binary');
            console.log('文件保存成功，路径：', filePath);
    
            // 提示用户并提供打开选项
            wx.showModal({
                title: '导出成功',
                content: `文件已保存至：\n${filePath}\n是否立即查看？`,
                confirmText: '查看文件',
                cancelText: '稍后查看',
                success: (res) => {
                    if (res.confirm) {
                        // 打开文件（微信支持直接预览Excel）
                        wx.openDocument({
                            filePath: filePath,
                            fileType: 'xlsx',
                            success: () => console.log('文件打开成功'),
                            fail: (err) => {
                                console.error('打开文件失败：', err);
                                wx.showToast({ title: '无法打开文件，请在文件管理中查找', icon: 'none' });
                            }
                        });
                    }
                }
            });
        } catch (err) {
            console.error('保存文件失败：', err);
            wx.showToast({ title: '文件保存失败', icon: 'none' });
        }
    }

});
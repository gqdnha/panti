import {
    getApartmentList,
    downLoadUserText,
    disableDepartment,
    grantDepartment
  } from '../../../api/apartmentAdmin'
  import { baseURL } from '../../../api/request'
  
  Page({
    data: {
      searchKeyword: '',
      departments: [], // 处理后的部门数据：[{level1Name, level2Departments: []}, ...]
      allDepartments: [] // 备份数据用于搜索
    },
  
    onLoad() {
      this.getApartmentListApi()
    },
  
    // 获取并处理部门列表
    getApartmentListApi() {
      getApartmentList().then(res => {
        console.log("原始部门数据:", res);
        
        // 处理嵌套的部门结构
        const processedDepartments = [];
        res.forEach(deptGroup => {
          for (const firstLevelName in deptGroup) {
            if (deptGroup.hasOwnProperty(firstLevelName)) {
              const secondLevelDepts = deptGroup[firstLevelName] || [];
              const formattedSecondLevel = secondLevelDepts.map(dept => ({
                ...dept,
                firstLevelName: firstLevelName // 仅用于展示
              }));
              processedDepartments.push({
                level1Name: firstLevelName,
                level2Departments: formattedSecondLevel
              });
            }
          }
        });
        
        this.setData({
          departments: processedDepartments,
          allDepartments: processedDepartments
        });
      }).catch(err => {
        console.error("获取部门列表失败：", err);
      });
    },
  
    // 切换部门启用/停用状态（点击时打印二级部门名称）
    toggleDeptStatus(e) {
      const departmentName = e.currentTarget.dataset.department;
      // 关键：打印二级部门名称（调试用）
      console.log("点击禁用/授权按钮，二级部门名称：", departmentName);
      
      if (!departmentName) {
        wx.showToast({ title: '部门名称为空', icon: 'none' });
        return;
      }
  
      // 查找部门状态
      let targetDept = null;
      for (const level1 of this.data.departments) {
        targetDept = level1.level2Departments.find(
          level2 => level2.department === departmentName
        );
        if (targetDept) break;
      }
      
      if (!targetDept) {
        wx.showToast({ title: '未找到该部门', icon: 'none' });
        return;
      }
  
      // 调用接口切换状态
      const apiCall = targetDept.isActive === 0 ? disableDepartment : grantDepartment;
      wx.showLoading({ title: '操作中...' });
      apiCall(departmentName)
        .then(res => {
            // 0代表已授权 1代表已禁用
          wx.hideLoading();
          this.getApartmentListApi();
          wx.showToast({ 
            title: targetDept.isActive === 1 ? '已授权' : '已禁用',
            icon: 'success'
          });
        })
        .catch(err => {
          wx.hideLoading();
          wx.showToast({ title: '操作失败', icon: 'none' });
          console.error('状态切换失败:', err);
        });
    },
  
    // 导出部门数据（点击时打印二级部门名称）
    exportDept(e) {
      const departmentName = e.currentTarget.dataset.name;
      // 关键：打印二级部门名称（调试用）
      console.log("点击导出按钮，二级部门名称：", departmentName);
      
      if (!departmentName) {
        wx.showToast({ title: '部门名称为空', icon: 'none' });
        return;
      }
  
      // 导出逻辑（保持不变）
      const data = [departmentName];
      const url = `${baseURL}/exportUserExcel`;
      wx.showLoading({ title: '导出中...' });
  
      wx.request({
        url: url,
        method: 'POST',
        data: data,
        header: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${wx.getStorageSync("gs-token")}`
        },
        responseType: 'arraybuffer',
        timeout: 30000,
        success: (res) => {
          wx.hideLoading();
          if (res.statusCode === 200) {
            const uint8Array = new Uint8Array(res.data);
            const isExcel = uint8Array.length > 2 && uint8Array[0] === 80 && uint8Array[1] === 75;
            if (isExcel) {
              this.saveExcelFile(res.data, `${departmentName}.xlsx`);
            } else {
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
    
    // 保存Excel文件到本地（保持不变）
    saveExcelFile(arrayBuffer, fileName) {
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      try {
        fs.writeFileSync(filePath, arrayBuffer, 'binary');
        console.log('文件保存成功，路径：', filePath);
        wx.showModal({
          title: '导出成功',
          content: `文件已保存至：\n${filePath}\n是否立即查看？`,
          confirmText: '查看文件',
          cancelText: '稍后查看',
          success: (res) => {
            if (res.confirm) {
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
    },
  
    // 搜索功能（保持不变）
    onSearchInput(e) {
      this.setData({ searchKeyword: e.detail.value });
    },
    onSearch() {
      const keyword = this.data.searchKeyword.trim().toLowerCase();
      if (!keyword) {
        this.setData({ departments: this.data.allDepartments });
        return;
      }
      const filtered = this.data.allDepartments.map(level1 => ({
        ...level1,
        level2Departments: level1.level2Departments.filter(level2 => 
          level2.department.toLowerCase().includes(keyword) || 
          level1.level1Name.toLowerCase().includes(keyword)
        )
      })).filter(level1 => level1.level2Departments.length > 0);
      this.setData({ departments: filtered });
    }
  });
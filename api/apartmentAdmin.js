import { request } from "./request";
import {getUserId} from './getUserId'

// 禁用部门
export const unuseApartment = (departmentId) => {
    console.log(departmentId);
    return request({
        url: `/mange/disableDepartment?departmentId=${departmentId}`,
        method: 'GET',
    });
};

// 批量禁用人员
/* export const unuseUser = (data) => {
    console.log(data);
    return request({
        url: `/mange/disableUser`,
        method: 'POST',
        data
    });
} */
// 获取部门列表

export const getApartmentList = () => {
    const userId = getUserId()
    return request({
        url: `/mange/getDepartmentList?userId=${userId}`,
        method: 'GET',
    });
}

// 导出部门人员
export const downLoadUserText = () => {
    const userId = getUserId()
    // console.log(data);
    return request({
        url: `/exportUserExcel?userId=${userId}`,
        method: 'GET',
    });
};
// 禁用部门
export const disableDepartment = (department) => {
    // console.log(data);
    return request({
        url: `/mange/disableDepartment?department=${department}`,
        method: 'POST',
    });
};
// 授权部门
export const grantDepartment = (department) => {
    return request({
        url: `/mange/grantDepartment?department=${department}`,
        method: 'POST',
    });
};
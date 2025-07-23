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
export const unuseUser = (data) => {
    console.log(data);
    return request({
        url: `/mange/disableUser?userIdList=${data}`,
        method: 'GET',
    });
}
// 获取部门列表

export const getApartmentList = () => {
    const userId = getUserId()
    return request({
        url: `/mange/getDepartmentList?userId=${userId}`,
        method: 'GET',
    });
}
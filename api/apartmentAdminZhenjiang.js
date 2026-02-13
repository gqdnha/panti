import { request } from "./request";

// 镇江地区禁用部门
export const disableDepartmentZhenjiang = (department) => {
    console.log(department,'api传参department');
    return request({
        url: `/mange/disableDepartmentZhenJiang?department=${department}`,
        method: 'POST',
    });
};

// 镇江地区授权部门
export const grantDepartmentZhenjiang = (department) => {
    console.log(department,'api传参department');
    return request({
        url: `/mange/grantDepartmentZhenJiang?department=${department}`,
        method: 'POST',
    });
};

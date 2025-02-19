"use client";
import { InputRef } from 'antd/es/input';
import { useEffect, useRef, useState } from "react";
import { useInterval, useWindowSize } from "usehooks-ts";
import { Input } from "antd";
import { toast } from 'react-toastify';
import { TYPE_CPU } from '../database';
import { api_get_chart_dien, api_get_chart_nuoc, api_get_cpu_info, api_get_list_name_dien, api_get_list_name_nuoc, api_set_plc_ip_value, api_set_plc_port_value } from '../api';
import { Select, DatePicker, } from "antd";
import type { DatePickerProps } from 'antd';
import ReactECharts from "echarts-for-react";

function BieuDoNangLuong() {
    const [button_is_free, setBtnFree] = useState(true);
    const [data, setData] = useState({
        'category': [],
        'value': [],
        // 'category': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        // 'value': [10, 52, 200, 334, 390, 330, 220],
    });
    const [legend, setLegend] = useState([true, true, true]);
    const [onEvents, setOnEvent] = useState({
        legendselectchanged: (e: any) => {
            console.log(e);
            let data = [
                e["selected"]["Giá trị đo"],
                e["selected"]["Giá trị min"],
                e["selected"]["Giá trị max"],
            ];
            setLegend(data);
        },
    });
    const [option, setOption] = useState<object>({
        animation: true,
        grid: {
            top: 30,
            bottom: 20,
            left: 60,
            right: 10,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: [
            {
                type: 'category',
                data: data['category'],
                axisTick: {
                    alignWithLabel: true
                },
                name: 'Thời gian',
                nameTextStyle: {
                    color: '#fff',
                    fontWeight: 'bold',
                },
                axisLabel: {
                    color: '#fff',
                    fontSize: 12,
                    rotate: 45,
                },
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: 'Điện năng (kWh)',
                nameTextStyle: {
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 14,
                    fontFamily: 'consola'
                }
            }
        ],
        series: [
            {
                name: 'Tiêu thụ (kWh)',
                type: 'bar',
                barWidth: '60%',
                itemStyle: {
                    color: '#ff0000AA',
                    borderColor: '#ff0000',
                    borderWidth: 2,
                    borderRadius: [3, 3, 0, 0],
                },
                data: data['value']
            }
        ]
    });
    const [picker_value, setPickerValue] = useState<any>(undefined)
    const [date_string, setDateString] = useState<any>('')
    const [name_idx, setNameIdx] = useState(0)
    const [name_idx2, setNameIdx2] = useState(0)
    const [type_idx, setTypeIdx] = useState(0)
    const [list_may, setListMay] = useState([
        { value: '0', label: 'Máy 1' },
        { value: '1', label: 'Máy 2' },
        { value: '2', label: 'Máy 3' },
        { value: '3', label: 'Máy 4' },
        { value: '4', label: 'Máy 5' },
        { value: '5', label: 'Máy 6' },
        { value: '6', label: 'Máy 7' },
        { value: '7', label: 'Máy 8' },
        { value: '8', label: 'Tất cả' },
        { value: '9', label: 'Không sử dụng' },
    ])
    const change_type = (value: string) => {
        const list = ['Ngày', 'Tuần', 'Tháng', 'Quý', 'Năm']
        console.log(list[Number.parseInt(value)]);
        if (value == '0')
            setPickerValue(undefined)
        if (value == '1')
            setPickerValue('week')
        if (value == '2')
            setPickerValue('month')
        if (value == '3')
            setPickerValue('quarter')
        if (value == '4')
            setPickerValue('year')
        setTypeIdx(Number.parseInt(value));
    }
    const change_may1 = (value: string) => {
        console.log(list_may[Number.parseInt(value)].label);
        setNameIdx(Number.parseInt(value));// 0->7, 8 mean all
    }
    const change_may2 = (value: string) => {
        console.log(list_may[Number.parseInt(value)].label);
        setNameIdx2(Number.parseInt(value));// 0->7, 8 mean all
    }
    const onChange: DatePickerProps['onChange'] = (date: any, dateString) => {
        console.log(date, dateString);
        if (dateString == '') {
            setDateString(dateString)
        }
        else {
            let yy = date['$y']
            let mm = date['$M'] + 1
            let dd = date['$D']
            setDateString(yy + '-' + mm + '-' + dd)
        }
    };
    const update_chart = (data: { category: never[], value: never[], name: string }) => {
        setOption({
            animation: true,
            legend: {
                show: true,
                textStyle: { color: '#fff' },
            },
            grid: {
                top: 30,
                bottom: 50,
                left: 60,
                right: 10,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: [
                {
                    type: 'category',
                    data: data['category'],
                    axisTick: {
                        alignWithLabel: true
                    },
                    name: 'Thời gian',
                    nameTextStyle: {
                        color: '#fff',
                        fontWeight: 'bold',
                    },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12,
                        rotate: 45,
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'Điện năng (kWh)',
                    nameTextStyle: {
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 14,
                        fontFamily: 'consola'
                    },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12,
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#ffffff40',
                        }
                    },
                }
            ],
            series: [
                {
                    name: data['name'] + ' (kWh)',
                    type: 'bar',
                    barWidth: '60%',
                    itemStyle: {
                        color: '#ff0000AA',
                        borderColor: '#ff0000',
                        borderWidth: 2,
                        borderRadius: [3, 3, 0, 0],
                    },
                    data: data['value']
                },
            ]
        })
    }
    const update_chart_2 = (data: { category: never[], value1: never[], value2: never[], name1: string, name2: string }) => {
        setOption({
            animation: true,
            legend: {
                show: true,
                textStyle: { color: '#fff' },
            },
            grid: {
                top: 30,
                bottom: 50,
                left: 60,
                right: 10,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: [
                {
                    type: 'category',
                    data: data['category'],
                    axisTick: {
                        alignWithLabel: true
                    },
                    name: 'Thời gian',
                    nameTextStyle: {
                        color: '#fff',
                        fontWeight: 'bold',
                    },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12,
                        rotate: 45,
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'Điện năng (kWh)',
                    nameTextStyle: {
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 14,
                        fontFamily: 'consola'
                    },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12,
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#ffffff40',
                        }
                    },
                }
            ],
            series: [

                {
                    name: data['name1'] + ' (kWh)',
                    type: 'bar',
                    barWidth: '30%',
                    itemStyle: {
                        color: '#001061fa',
                        borderColor: '#71779bf8',
                        borderWidth: 1.5,
                        borderRadius: [3, 3, 0, 0],
                    },
                    data: data['value1']
                },
                {
                    name: data['name2'] + ' (kWh)',
                    type: 'bar',
                    barWidth: '30%',
                    itemStyle: {
                        color: '#ff0000AA',
                        borderColor: '#ff0000',
                        borderWidth: 2,
                        borderRadius: [3, 3, 0, 0],
                    },
                    data: data['value2']
                },
            ]
        })
    }
    const cap_nhat_data = async () => {
        if (button_is_free == false) return;
        setBtnFree(false);
        toast.dismiss();
        if (date_string === '') {
            toast.error('Vui lòng chọn thời gian');
            setBtnFree(true);
            return;
        }
        update_chart({ category: [], value: [], name: '' });
        toast.info('Đang cập nhật dữ liệu');
        console.log('cap nhat data', name_idx, name_idx2, type_idx, date_string);
        let res;
        if (name_idx == name_idx2)
            res = await api_get_chart_dien(name_idx, 9, type_idx, date_string);
        else
            res = await api_get_chart_dien(name_idx, name_idx2, type_idx, date_string);
        toast.dismiss();
        if (res == undefined) {
            toast.error('Lỗi kết nối đến server');
            setBtnFree(true);
            return;
        }
        if (name_idx != 9 && name_idx2 != 9 && name_idx != name_idx2)
            update_chart_2(res);
        else if (name_idx != 9 || name_idx2 != 9)
            update_chart(res);
        setBtnFree(true);
    }

    useEffect(() => {
        async function first_get_name() {
            let res = await api_get_list_name_dien()
            if (res != undefined) {
                setListMay(res);
            }
        }
        first_get_name()
    }, [])
    return <div className='w-full h-full flex flex-col text-lg border-[1px] border-[#ff0000] rounded-md p-2
                    bg-gradient-to-b from-[#a6a5b822] via-[#a6a5b844] to-[#a6a5b833]
                    shadow-[0px_0px_2px_2px_#ff000088] '>
        <div className='flex flex-row w-full items-center gap-2'>
            <div className='pl-2'>BIỂU ĐỒ TIÊU THỤ ĐIỆN</div>
            <div className='flex-1'></div>
            <div>MÁY</div>
            <Select
                defaultValue={'0'}
                options={list_may}
                style={{
                    width: 220,
                }}
                onChange={change_may1} />
            <div>VÀ MÁY</div>
            <Select
                defaultValue={'0'}
                options={list_may}
                style={{
                    width: 220,
                }}
                onChange={change_may2} />
            <div>THỜI GIAN</div>
            <Select
                defaultValue={'0'}
                onChange={change_type}
                options={[
                    { value: '0', label: 'Ngày' },
                    { value: '1', label: 'Tuần' },
                    { value: '2', label: 'Tháng' },
                    { value: '3', label: 'Quý' },
                    { value: '4', label: 'Năm' },
                ]}
                style={{
                    width: 100,
                }} />
            <DatePicker
                onChange={onChange}
                picker={picker_value} />

            <div className='rounded-lg bg-green-600 hover:bg-green-500 active:bg-green-600 hover:cursor-pointer py-2 px-4 shadow-[inset_0px_0px_2px_2px_#fff]
                    hover:-translate-y-1 active:translate-y-0 duration-150'
                onClick={cap_nhat_data}
            >CẬP NHẬT</div>
        </div>
        <div className={`flex-1 h-full w-full mt-3`}>
            <ReactECharts
                style={{ width: `${100}px` }}//Phải có để tự co dãn
                option={option}
                notMerge={true}
                lazyUpdate={true}
                className="flex-1 min-w-full min-h-full m-0 p-0"
                onEvents={onEvents}
            />
        </div>
    </div>
}
function BieuDoNuoc() {
    const [button_is_free, setBtnFree] = useState(true);
    const [data, setData] = useState({
        'category': [],
        'value': [],
        // 'category': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        // 'value': [10, 52, 200, 334, 390, 330, 220],
    });
    const [legend, setLegend] = useState([true, true, true]);
    const [onEvents, setOnEvent] = useState({
        legendselectchanged: (e: any) => {
            console.log(e);
            let data = [
                e["selected"]["Giá trị đo"],
                e["selected"]["Giá trị min"],
                e["selected"]["Giá trị max"],
            ];
            setLegend(data);
        },
    });
    const [option, setOption] = useState<object>({
        animation: true,
        grid: {
            top: 30,
            bottom: 20,
            left: 60,
            right: 10,
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        xAxis: [
            {
                type: 'category',
                data: data['category'],
                axisTick: {
                    alignWithLabel: true
                },
                name: 'Thời gian',
                nameTextStyle: {
                    color: '#fff',
                    fontWeight: 'bold',
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: 'Lượng nước (m3)',
                nameTextStyle: {
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 14,
                    fontFamily: 'consola'
                }
            }
        ],
        series: [
            {
                name: 'Lượng nước (m3)',
                type: 'bar',
                barWidth: '60%',
                itemStyle: {
                    color: '#00ff00AA',
                    borderColor: '#00ff00',
                    borderWidth: 2,
                    borderRadius: [3, 3, 0, 0],
                },
                data: data['value']
            }
        ]
    });
    const [picker_value, setPickerValue] = useState<any>(undefined)
    const [date_string, setDateString] = useState<any>('')
    const [name_idx, setNameIdx] = useState(0)
    const [name_idx2, setNameIdx2] = useState(0)
    const [type_idx, setTypeIdx] = useState(0)
    const [list_may, setListMay] = useState([
        { value: '0', label: 'Máy 1' },
        { value: '1', label: 'Máy 2' },
        { value: '2', label: 'Máy 3' },
        { value: '3', label: 'Máy 4' },
        { value: '4', label: 'Máy 5' },
        { value: '5', label: 'Máy 6' },
        { value: '6', label: 'Tất cả' },
        { value: '7', label: 'Không sử dụng' },
    ])
    const change_type = (value: string) => {
        const list = ['Ngày', 'Tuần', 'Tháng', 'Quý', 'Năm']
        console.log(list[Number.parseInt(value)]);
        if (value == '0')
            setPickerValue(undefined)
        if (value == '1')
            setPickerValue('week')
        if (value == '2')
            setPickerValue('month')
        if (value == '3')
            setPickerValue('quarter')
        if (value == '4')
            setPickerValue('year')
        setTypeIdx(Number.parseInt(value));
    }
    const change_may1 = (value: string) => {
        console.log(list_may[Number.parseInt(value)].label);
        setNameIdx(Number.parseInt(value));// 0->7, 8 mean all
    }
    const change_may2 = (value: string) => {
        console.log(list_may[Number.parseInt(value)].label);
        setNameIdx2(Number.parseInt(value));// 0->7, 8 mean all
    }
    const onChange: DatePickerProps['onChange'] = (date: any, dateString) => {
        console.log(date, dateString);
        if (dateString == '') {
            setDateString(dateString)
        }
        else {
            let yy = date['$y']
            let mm = date['$M'] + 1
            let dd = date['$D']
            setDateString(yy + '-' + mm + '-' + dd)
        }
    };
    const update_chart = (data: { category: never[], value: never[], name: string }) => {
        setOption({
            animation: true,
            legend: {
                show: true,
                textStyle: { color: '#fff' },
            },
            grid: {
                top: 30,
                bottom: 50,
                left: 60,
                right: 10,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: [
                {
                    type: 'category',
                    data: data['category'],
                    axisTick: {
                        alignWithLabel: true
                    },
                    name: 'Thời gian',
                    nameTextStyle: {
                        color: '#fff',
                        fontWeight: 'bold',
                    },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12,
                        rotate: 45,
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'Lượng nước (m3)',
                    nameTextStyle: {
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 14,
                        fontFamily: 'consola'
                    },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12,
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#ffffff40',
                        }
                    },
                }
            ],
            series: [
                {
                    name: data['name'] + ' (m3)',
                    type: 'bar',
                    barWidth: '60%',
                    itemStyle: {
                        color: '#00ff00AA',
                        borderColor: '#00ff00',
                        borderWidth: 2,
                        borderRadius: [3, 3, 0, 0],
                    },
                    data: data['value']
                }
            ]
        })
    }
    const update_chart_2 = (data: { category: never[], value1: never[], value2: never[], name1: string, name2: string }) => {
        setOption({
            animation: true,
            legend: {
                show: true,
                textStyle: { color: '#fff' },
            },
            grid: {
                top: 30,
                bottom: 50,
                left: 60,
                right: 10,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: [
                {
                    type: 'category',
                    data: data['category'],
                    axisTick: {
                        alignWithLabel: true
                    },
                    name: 'Thời gian',
                    nameTextStyle: {
                        color: '#fff',
                        fontWeight: 'bold',
                    },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12,
                        rotate: 45,
                    },
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'Lượng nước (m3)',
                    nameTextStyle: {
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 14,
                        fontFamily: 'consola'
                    },
                    axisLabel: {
                        color: '#fff',
                        fontSize: 12,
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#ffffff40',
                        }
                    },
                }
            ],
            series: [
                {
                    name: data['name1'] + ' (m3)',
                    type: 'bar',
                    barWidth: '30%',
                    itemStyle: {
                        color: '#001061fa',
                        borderColor: '#71779bf8',
                        borderWidth: 1.5,
                        borderRadius: [3, 3, 0, 0],
                    },
                    data: data['value1']
                },
                {
                    name: data['name2'] + ' (m3)',
                    type: 'bar',
                    barWidth: '30%',
                    itemStyle: {
                        color: '#00ff00AA',
                        borderColor: '#00ff00',
                        borderWidth: 2,
                        borderRadius: [3, 3, 0, 0],
                    },
                    data: data['value2']
                }
            ]
        })
    }
    useEffect(() => {
        async function first_get_name() {
            let res = await api_get_list_name_nuoc()
            if (res != undefined) {
                setListMay(res);
            }
        }
        first_get_name()
    }, [])
    const cap_nhat_data = async () => {
        if (button_is_free == false) return;
        setBtnFree(false);
        toast.dismiss();
        if (date_string === '') {
            toast.error('Vui lòng chọn thời gian');
            setBtnFree(true);
            return;
        }
        update_chart({ category: [], value: [], name: '' });
        toast.info('Đang cập nhật dữ liệu');
        console.log('cap nhat data', name_idx, name_idx2, type_idx, date_string);
        let res;
        if (name_idx == name_idx2)
            res = await api_get_chart_nuoc(name_idx, 7, type_idx, date_string);
        else
            res = await api_get_chart_nuoc(name_idx, name_idx2, type_idx, date_string);
        toast.dismiss();
        if (res == undefined) {
            toast.error('Lỗi kết nối đến server');
            setBtnFree(true);
            return;
        }
        if (name_idx != 7 && name_idx2 != 7 && name_idx != name_idx2)
            update_chart_2(res);
        else if (name_idx != 7 || name_idx2 != 7)
            update_chart(res);
        setBtnFree(true);
    }
    return <div className='w-full h-full flex flex-col text-lg border-[1px] border-[#00ff00] rounded-md p-2
                    bg-gradient-to-b from-[#a6a5b855] via-[#18172e99] to-[#0b0925cc]
                    shadow-[0px_0px_2px_2px_#00ff0088] '>
        <div className='flex flex-row w-full items-center gap-2'>
            <div className='pl-2'>BIỂU ĐỒ TIÊU THỤ NƯỚC</div>
            <div className='flex-1'></div>
            <div>MÁY</div>
            <Select
                defaultValue={'0'}
                options={list_may}
                style={{
                    width: 220,
                }}
                onChange={change_may1} />
            <div>MÁY</div>
            <Select
                defaultValue={'0'}
                options={list_may}
                style={{
                    width: 220,
                    color: '#00ff00',
                }}
                onChange={change_may2} />
            <div>THỜI GIAN</div>
            <Select
                defaultValue={'0'}
                onChange={change_type}
                options={[
                    { value: '0', label: 'Ngày' },
                    { value: '1', label: 'Tuần' },
                    { value: '2', label: 'Tháng' },
                    { value: '3', label: 'Quý' },
                    { value: '4', label: 'Năm' },
                ]}
                style={{
                    width: 100,
                }} />
            <DatePicker
                onChange={onChange}
                picker={picker_value} />

            <div className='rounded-lg bg-green-600 hover:bg-green-500 active:bg-green-600 hover:cursor-pointer py-2 px-4 shadow-[inset_0px_0px_2px_2px_#fff]
                    hover:-translate-y-1 active:translate-y-0 duration-150'
                onClick={cap_nhat_data}
            >CẬP NHẬT</div>
        </div>
        <div className={`flex-1 h-full w-full mt-3`}>
            <ReactECharts
                style={{ width: `${100}px` }}//Phải có để tự co dãn
                option={option}
                notMerge={true}
                lazyUpdate={true}
                className="flex-1 min-w-full min-h-full m-0 p-0"
                onEvents={onEvents}
            />
        </div>
    </div>
}



export default function Page() {

    return (
        <div
            className={`text-white text-3xl font-bold w-full h-screen flex flex-col p-2 gap-2 pt-4
                `}
        >
            <div className={`m-1 text-center`}>PHẦN MỀM GIÁM SÁT NĂNG LƯỢNG</div>
            <div className='flex-1 grid grid-rows-2 w-full h-full gap-3'>
                <BieuDoNangLuong />
                <BieuDoNuoc />
            </div>
        </div>
    );
}

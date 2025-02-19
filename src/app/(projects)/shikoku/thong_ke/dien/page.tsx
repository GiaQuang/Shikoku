"use client";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { api_get_chart_dien, api_get_cpu_info, api_get_list_name_dien, api_xuat_du_lieu } from '../../api';
import { Select, DatePicker, } from "antd";
import type { DatePickerProps } from 'antd';
import ReactECharts from "echarts-for-react";
import { MdAttachMoney } from "react-icons/md";
import { MdElectricBolt } from "react-icons/md";
import {
    BarChartOutlined,
} from "@ant-design/icons";
import { useInterval } from "usehooks-ts";
function BieuDoNangLuong({ f_chart_1, f_chart_2, tieu_thu, tien }: { f_chart_1: Function, f_chart_2: Function, tieu_thu: {}, tien: {} }) {
    const [button_is_free, setBtnFree] = useState(true);
    const [object_1, setObject1] = useState<any>(undefined);
    const [object_2, setObject2] = useState<any>(undefined);
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
        const list = ['Ngày', 'Tuần', 'Tháng', 'Năm']
        console.log(list[Number.parseInt(value)]);
        if (value == '0')
            setPickerValue(undefined)
        if (value == '1')
            setPickerValue('week')
        if (value == '2')
            setPickerValue('month')
        if (value == '3')
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
        f_chart_1(data)
        setOption({
            animation: true,
            legend: {
                show: true,
                textStyle: { color: '#fff' },
            },
            grid: {
                top: 30,
                bottom: 65,
                left: 60,
                right: 10,
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'category',
                data: data['category'],
                axisTick: {
                    alignWithLabel: true
                },
                name: 'Thời gian',
                nameLocation: 'center',
                nameGap: 45,
                nameTextStyle: {
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 20,
                    fontFamily: 'times'
                },

                axisLabel: {
                    color: '#fff',
                    fontSize: 12,
                    rotate: 45,
                },
            }
            ,
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
        f_chart_2(data)
        setOption({
            animation: true,
            legend: {
                show: true,
                textStyle: { color: '#fff' },
            },
            grid: {
                top: 30,
                bottom: 65,
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
                    nameLocation: 'center',
                    nameGap: 45,
                    nameTextStyle: {
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 20,
                        fontFamily: 'times'
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
        toast.info('Đang cập nhật dữ liệu', {
            autoClose: 15000
        });
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
        if (name_idx != 9 && name_idx2 != 9 && name_idx != name_idx2) {
            setObject1(undefined);
            setObject2(res);
            update_chart_2(res);
        }
        else if (name_idx != 9 || name_idx2 != 9) {
            setObject1(res);
            setObject2(undefined);
            update_chart(res);
        }
        setBtnFree(true);
    }

    const xuat_du_lieu = async () => {
        if (button_is_free == false) return;
        setBtnFree(false);
        toast.dismiss();
        if (object_1 === undefined && object_2 == undefined) {
            toast.error('Không có dữ liệu để xuất');
            setBtnFree(true);
            return;
        }
        toast.info('Đang xuất', {
            autoClose: 15000
        });
        let res;
        if (object_1 === undefined)
            res = await api_xuat_du_lieu({ type: 'dien', data: object_2, tieu_thu: tieu_thu, tien: tien });
        else
            res = await api_xuat_du_lieu({ type: 'dien', data: object_1, tieu_thu: tieu_thu, tien: tien });
        toast.dismiss();
        if (res == undefined) {
            toast.error('Lỗi kết nối đến server');
            setBtnFree(true);
            return;
        }
        if (res == true)
            toast.success('Xuất dữ liệu thành công');
        else
            toast.error('Lỗi khi xuất dữ liệu');
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
            <div className='pl-2 flex flex-row gap-2'>
                <BarChartOutlined style={{ fontSize: 28 }} />
                <div>
                    BIỂU ĐỒ TIÊU THỤ ĐIỆN
                </div>
            </div>
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
                    { value: '3', label: 'Năm' },
                ]}
                style={{
                    width: 100,
                }} />
            <DatePicker
                onChange={onChange}
                picker={picker_value} />

            <div className={`rounded-lg bg-green-600 
                    py-2 px-4 shadow-[inset_0px_0px_2px_2px_#fff]
                    ${button_is_free == false ? `disable opacity-55` : `hover:bg-green-500 active:bg-green-600 hover:cursor-pointer hover:-translate-y-1 active:translate-y-0 duration-150`}
                    `}
                onClick={cap_nhat_data}
            >CẬP NHẬT</div>

            <div className={`rounded-lg bg-orange-600 
                    py-2 px-4 shadow-[inset_0px_0px_2px_2px_#fff]
                    ${button_is_free == false ? `disable opacity-55` : `hover:bg-orange-500 active:bg-orange-600 hover:cursor-pointer hover:-translate-y-1 active:translate-y-0 duration-150`}
                    `}
                onClick={xuat_du_lieu}
            >XUẤT DỮ LIỆU</div>
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
function BieuDoTronDienNang({ data }: {
    data: {
        name1: string,
        name2: string,
        value1: number,
        value2: number,
    }
}) {
    console.log('tron dien nang', data);
    const option = {
        tooltip: {
            trigger: 'item',
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: '30%',
            textStyle: {
                color: '#fff',
                fontFamily: 'arial'
            },
            show: true,
        },
        series: [
            {
                name: 'Biểu đồ điện năng',
                type: 'pie',
                radius: ['40%', '80%'],
                avoidLabelOverlap: false,
                padAngle: 3,
                itemStyle: {
                    normal: {
                        borderRadius: 5,
                        label: {
                            show: true,
                            rotate: 0,
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: 13,
                            formatter: function (params: any) {
                                params.seriesIndex;
                                params.dataIndex;
                                params.value;
                                return params.value.toLocaleString() + ' kWh';
                            },
                        },
                    },
                },
                startAngle: 180,
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: true,
                    lineStyle: {
                        width: 2,
                    },
                },
                data: [
                    { value: data.value1, name: data.name1, itemStyle: { color: '#001061AA' } },
                    { value: data.value2, name: data.name2, itemStyle: { color: '#f00' } },
                ]
            }
        ]
    };
    return <div className='w-full h-full flex flex-col text-lg rounded-md p-2 bg-[#8922a3]'>
        <div className='flex flex-row w-full items-center gap-2'>
            <MdElectricBolt style={{ fontSize: 60 }} />
            <div className='pl-2 w-full text-center text-3xl mt-2'>ĐIỆN NĂNG TIÊU THỤ</div>
        </div>

        <div className={`flex-1 h-full w-full mt-3`}>
            <ReactECharts
                style={{ width: `0px`, height: '0px' }}//Phải có để tự co dãn
                option={option}
                notMerge={true}
                lazyUpdate={true}
                className="flex-1 min-w-full min-h-full m-0 p-0"
            />
        </div>
    </div>
}
function BieuDoTronChiPhi({ data }: {
    data: {
        name1: string,
        name2: string,
        value1: number,
        value2: number,
    }
}) {

    const option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: '30%',
            textStyle: {
                color: '#fff',
                fontFamily: 'arial',
            },
            show: true,
        },
        series: [
            {
                name: 'Biểu đồ chi phí',
                type: 'pie',
                radius: ['40%', '80%'],
                avoidLabelOverlap: false,
                padAngle: 3,
                itemStyle: {
                    normal: {
                        borderRadius: 5,
                        label: {
                            show: true,
                            rotate: 0,
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: 13,
                            formatter: function (params: any) {
                                params.seriesIndex;
                                params.dataIndex;
                                params.value;
                                return params.value.toLocaleString() + ' VNĐ';
                            },
                        },
                    },
                },
                startAngle: 180,
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 40,
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: true,
                    lineStyle: {
                        width: 2,
                    },
                },
                data: [
                    { value: data.value1, name: data.name1, itemStyle: { color: '#001061AA' } },
                    { value: data.value2, name: data.name2, itemStyle: { color: '#f00' } },
                ],
            }
        ]
    };
    return <div className='w-full h-full flex flex-col text-lg rounded-md p-2 
            bg-gradient-to-br  to-[#8922a3] from-[#da2218]'>
        <div className='flex flex-row w-full items-center gap-2'>
            <MdAttachMoney style={{ fontSize: 60 }} />
            <div className='pl-2 w-full text-center text-3xl mt-2'>CHI PHÍ TIÊU THỤ</div>
        </div>
        <div className={`flex-1 h-full w-full mt-3`}>
            <ReactECharts
                style={{ width: `0px`, height: '0px' }}//Phải có để tự co dãn
                option={option}
                notMerge={true}
                lazyUpdate={true}
                className="flex-1 min-w-full min-h-full m-0 p-0"
            />
        </div>
    </div>
}
export default function Page() {
    const [dien_nuoc, setDienNuoc] = useState({
        gia_dien: 0,
        gia_nuoc: 0,
    })
    const [cycle, setCycle] = useState<null | number>(100)
    useInterval(async () => {
        setCycle(null)
        let res = await api_get_cpu_info()
        if (res != undefined) {
            setDienNuoc({
                gia_dien: res['gia_dien'],
                gia_nuoc: res['gia_nuoc'],
            })
        }
        setCycle(1000);
    }, cycle)
    const [data, setData] = useState({
        name1: '-',
        name2: '--',
        value1: 0,
        value2: 1,
    })
    const [tien, setTien] = useState({
        name1: '-',
        name2: '--',
        value1: 0,
        value2: 1,
    })

    const f_chart_1 = (data: { category: never[], value: never[], name: string }) => {
        console.log(data);
        setData({
            name1: '-',
            name2: data.name,
            value1: 0,
            value2: Number.parseFloat(data.value.reduce((a, b) => a + b, 0).toFixed(2)),
        })
        setTien({
            name1: '-',
            name2: data.name,
            value1: 0,
            value2: Number.parseFloat((data.value.reduce((a, b) => a + b, 0) * dien_nuoc.gia_dien).toFixed(0)),
        })
    }

    const f_chart_2 = (data: { category: never[], value1: never[], value2: never[], name1: string, name2: string }) => {
        console.log(data);
        setData({
            name1: data.name1,
            name2: data.name2,
            value1: Number.parseFloat(data.value1.reduce((a, b) => a + b, 0).toFixed(2)),
            value2: Number.parseFloat(data.value2.reduce((a, b) => a + b, 0).toFixed(2)),
        })
        setTien({
            name1: data.name1,
            name2: data.name2,
            value1: Number.parseFloat((data.value1.reduce((a, b) => a + b, 0) * dien_nuoc.gia_dien).toFixed(0)),
            value2: Number.parseFloat((data.value2.reduce((a, b) => a + b, 0) * dien_nuoc.gia_dien).toFixed(0)),
        })
    }

    return (
        <div
            className={`text-white text-3xl font-bold w-full h-screen flex flex-col p-2 gap-2 pt-4
                `}
        >
            <div className={`m-1 text-center`}>TÍNH TOÁN CHI PHÍ TIÊU THỤ ĐIỆN</div>
            <div className='flex-1 grid grid-rows-3 w-full h-full gap-3'>
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md ring-2 ring-[#f00] h-full w-full"><BieuDoTronDienNang data={data} /></div>
                    <div className="rounded-md ring-2 ring-[#fff] h-full w-full"><BieuDoTronChiPhi data={tien} /></div>
                </div>
                <div className="row-span-2"><BieuDoNangLuong f_chart_1={f_chart_1} f_chart_2={f_chart_2} tieu_thu={data} tien={tien} /></div>
            </div>
        </div>
    );
}

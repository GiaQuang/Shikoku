"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInterval, useSessionStorage, useWindowSize } from "usehooks-ts";
import { clone_object, random_float, random_int } from "@/app/utils/utils";
import { toast } from "react-toastify";
import { api_get_cpu_info, api_get_tong_quan_dien, api_get_tong_quan_nuoc } from "../api";
import { TYPE_CPU, TYPE_DIEN, TYPE_NUOC } from "../database";


function WidgetDien({ data }: { data: TYPE_DIEN[] }) {
    return <div className="flex flex-col h-full w-full border-white border-r-2 pr-1">
        <div className="flex items-center justify-center text-lg mt-2 text-white bg-red-500 mx-2 py-2">ĐỒNG HỒ ĐO ĐIỆN</div>
        <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-2 p-2">{
            data.map((item, idx) => {
                if (item['id'] < 0) {
                    return <div key={idx}
                        className="flex w-full h-full items-center justify-center text-xl rounded-lg bg-black opacity-85
                            text-center shadow-[inset_0px_0px_2px_2px_#aaa]">
                        KHÔNG HOẠT ĐỘNG
                    </div>
                }
                return <div key={idx}
                    className="flex flex-col w-full h-full items-center justify-center text-xl rounded-lg
                            text-center shadow-[inset_0px_0px_2px_2px_#fff] p-[2px]">
                    <div className="flex items-center justify-center py-2 bg-red-600 w-full rounded-t-lg">{item.name}</div>
                    <div className="flex-1 flex items-center justify-center text-5xl w-full h-full
                        bg-gradient-to-b to-[#0b0925] via-[#2f2e3e] from-[#383749]
                        flex-row
                    ">
                        <div>{item.dien_nang_tieu_thu}</div>
                        <div className="text-lg ml-2 mt-6">kWh</div>
                    </div>
                    <div className="grid grid-cols-3 text-[1rem] font-bold w-full py-1 gap-1
                                bg-gradient-to-b to-[#373648] via-[#28273d] from-[#373648] ">
                        <div className="flex flex-col text-[#ff1613] gap-1">
                            <div>{item.dien_ap_12} (V)</div>
                            <div>{item.dong_dien_i1} (A)</div>
                        </div>
                        <div className="flex flex-col text-[#d3d303] gap-1">
                            <div>{item.dien_ap_23} (V)</div>
                            <div>{item.dong_dien_i2} (A)</div>
                        </div>
                        <div className="flex flex-col text-[#1164a8] gap-1">
                            <div>{item.dien_ap_31} (V)</div>
                            <div>{item.dong_dien_i3} (A)</div>
                        </div>
                    </div>
                    <div className="border-t-2 border-white flex flex-row w-full bg-white text-green-800 rounded-b-lg">
                        <div className="flex-1 ml-2 my-0 flex items-start text-[1rem]">Chạy từ : {item.time_start}</div>
                    </div>

                </div>
            })
        }
        </div>
    </div>
}

function WidgetNuoc({ data }: { data: TYPE_NUOC[] }) {
    return <div className="flex flex-col h-full w-full">
        <div className="flex items-center justify-center text-lg mt-2 text-white bg-green-700 mx-2 py-2">ĐỒNG HỒ ĐO NƯỚC</div>
        <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-2 p-2">{
            data.map((item, idx) => {
                if (item['id'] < 0) {
                    return <div key={idx}
                        className="flex w-full h-full items-center justify-center text-xl rounded-lg bg-black opacity-85
                            text-center shadow-[inset_0px_0px_2px_2px_#aaa]">
                        KHÔNG HOẠT ĐỘNG
                    </div>
                }
                return <div key={idx}
                    className="flex flex-col w-full h-full items-center justify-center text-xl rounded-lg
                            text-center shadow-[inset_0px_0px_2px_2px_#fff] p-[2px]">
                    <div className="flex items-center justify-center py-2 bg-green-600 w-full rounded-t-lg">{item.name}</div>
                    <div className="flex-1 flex items-center justify-center text-5xl w-full h-full
                        bg-gradient-to-b to-[#0b0925] via-[#2f2e3e] from-[#383749]
                        flex-row
                    ">
                        <div>{item.m3}</div>
                        <div className="text-lg ml-2 mt-6">m3</div>
                    </div>
                    <div className="border-t-2 border-white flex flex-row w-full bg-white text-green-800 rounded-b-lg">
                        <div className="flex-1 ml-2 my-0 flex items-start text-[1rem]">Chạy từ : {item.time_start}</div>
                    </div>

                </div>
            })
        }
        </div>
    </div>
}

export default function Page() {
    const { width = 0, height = 0 } = useWindowSize()
    const [dataSource, setDataSource] = useState<{ key: string; time: string; desc: string; }[]>([])
    const [cycle_rt_status, setCycleRfStatus] = useState<number | null>(500);
    const [cpu_info, setCpuInfo] = useState<TYPE_CPU>({
        connection: true,
        ip: '127.0.0.1',
        port: 502,
        gia_dien: 0,
        gia_nuoc: 0,
        fps: 0,
    });
    const [list_dien, setListDien] = useState<TYPE_DIEN[]>(Array.from(Array(9).keys(), (value, key) => {
        if (key < 1)
            return {
                id: -1,

            }
        return {
            id: key,
            name: 'ĐỒNG HỒ ĐIỆN',
            dien_ap_12: 123,
            dien_ap_23: 456,
            dien_ap_31: 789,
            dong_dien_i1: 10.1,
            dong_dien_i2: 10.2,
            dong_dien_i3: 10.3,
            p_tieu_thu: 12345,
            p_phan_khang: 111,
            p_bieu_kien: 222,
            dien_nang_tieu_thu: 333,
            time_start: '00:00:00',
            time_delta: 1000,
        }
    }));
    const [list_nuoc, setListNuoc] = useState<TYPE_NUOC[]>(Array.from(Array(9).keys(), (value, key) => {
        if (key < 1)
            return {
                id: -1
            }
        return {
            id: key,
            name: 'ĐỒNG HỒ NƯỚC',
            m3: 1234,
            time_start: '0:00:00',
            time_delta: 1000,
        }
    }));
    const [counter, setCounter] = useState(0);

    useEffect(() => {

    }, []);
    useInterval(() => {
        setCounter((p) => p + 1);
    }, 500);


    useInterval(async () => {
        setCycleRfStatus(null);
        // Sử dụng await với Promise.allSettled để đợi tất cả các promise hoàn thành
        const results = await Promise.allSettled([api_get_tong_quan_dien(), api_get_tong_quan_nuoc(), api_get_cpu_info()]);
        // Kiểm tra kết quả của từng promise
        const [result1, result2, result3] = results;
        if (result1.status === 'fulfilled' && result2.status === 'fulfilled' && result3.status === 'fulfilled') {
            // Nếu tất cả API đều thành công
            let data = { dien: result1.value, nuoc: result2.value, cpu_info: result3.value };
            if (data.dien != undefined && data.nuoc != undefined && data.cpu_info != undefined) {
                setCpuInfo(data.cpu_info)
                while (data.dien.length < 9) {
                    data.dien.push({
                        id: -1
                    })
                }
                while (data.nuoc.length < 9) {
                    data.nuoc.push({
                        id: -1
                    })
                }
                setListDien(data.dien)
                setListNuoc(data.nuoc)
                setCycleRfStatus(100);
            }
            else
                setCycleRfStatus(3000);
        } else {
            // Xử lý lỗi nếu có từ một trong các API
            let error = { status1: result1.status, status2: result2.status };
            setCycleRfStatus(3000);
        }
    }, cycle_rt_status);
    return (
        <div
            className={`text-white text-3xl font-bold w-full h-screen flex flex-col p-2 gap-1 pt-4
            min-w-[1190px] min-h-[660px]
            ${cpu_info.connection == false || cpu_info.fps == 0 && counter % 2 == 0 ? `bg-gradient-to-b from-[#a00] to-[#c00]` : ``}
                `}
        >
            <div className={`m-1 text-center`}>{`${cpu_info.connection == false ? `MẤT KẾT NỐI ĐẾN THIẾT BỊ` : `PHẦN MỀM GIÁM SÁT NĂNG LƯỢNG`}`}</div>
            <div className={`flex-1 grid grid-cols-2 gap-1
                    ${cpu_info.connection == false ? `opacity-20` : ``}
                `}>
                <WidgetDien data={list_dien} />
                <WidgetNuoc data={list_nuoc} />
            </div>
            <div className="flex flex-row items-center text-lg">
                <div className="flex-1 opacity-50">{`(OK=${cpu_info.counter_OK} NG=${cpu_info.counter_NG}) ${cpu_info.info}`}</div>
                <div className="text-right mx-2">{cpu_info.fps} (FPS)</div>
            </div>
        </div>
    );
}

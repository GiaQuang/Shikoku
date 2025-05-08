// "use client";
// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useInterval } from "usehooks-ts";
// import * as echarts from "echarts";
// import { api_get_error_machines } from "../api";

// type ErrorCode =
//   | "e01"
//   | "e02"
//   | "e03"
//   | "e04"
//   | "e05"
//   | "e06"
//   | "e07"
//   | "e08"
//   | "e09"
//   | "e10"
//   | "e11"
//   | "e12"
//   | "e13";

// type MachineData = {
//   id: number;
//   hieu_suat: number;
//   so_met_dat: number;
//   so_met_thuc: number;
//   toc_do_dat: number;
//   toc_do_thuc: number;
//   startTime: string;
//   history: {
//     timestamp: string;
//     status: boolean;
//     ma_loi: ErrorCode | null;
//   }[];
// };

// const statusColors: Record<string, string> = {
//   running: "#008000", // Máy chạy
//   stopped: "#00BFFF", // Máy dừng
//   off: "#808080", // Máy tắt
// };

// const errorCodes: Record<string, { message: string; color: string }> = {
//   e01: { message: "Đứt sợi trên", color: "#FF0000" },
//   e02: { message: "Đứt sợi dưới", color: "#FFA500" },
//   e03: { message: "Đứt lõi cách điện", color: "#00BFFF" },
//   e04: { message: "Đứt băng nhôm", color: "#FFFF00" },
//   e05: { message: "Bơm dầu không lên", color: "#800080" },
//   e06: { message: "Mức dầu thấp", color: "#800080" },
//   e07: { message: "Quá tải bơm dầu", color: "#800080" },
//   e08: { message: "Lỗi biến tần", color: "#800080" },
//   e09: { message: "Truyền thông biến tần", color: "#800080" },
//   e10: { message: "Lỗi trục cuốn", color: "#800080" },
//   e11: { message: "Báo động maoci", color: "#800080" },
//   e12: { message: "Cửa mở", color: "#800080" },
//   e13: { message: "Đang dừng khẩn cấp", color: "#800080" },
// };

// const MachineChart = () => {
//   const chartRef = useRef<HTMLDivElement>(null);
//   const chartInstance = useRef<echarts.ECharts | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [autoScroll, setAutoScroll] = useState(false);
//   const [scrollInterval, setScrollInterval] = useState(5);
//   const [machinesData, setMachinesData] = useState<MachineData[]>([]);

//   const machinesPerPage = 10;
//   const totalMachines = 200;
//   const totalPages = Math.ceil(totalMachines / machinesPerPage);

//   const fetchMachineData = useCallback(async () => {
//     try {
//       const res = await api_get_error_machines();
//       const data = res instanceof Response ? await res.json() : res;
//       console.log("Lấy dữ liệu từ API:", data);

//       if (data?.machines) {
//         setMachinesData((prevData) => {
//           const newData = data.machines as MachineData[];
//           const hasChanges = newData.some((newMachine) => {
//             const prevMachine = prevData.find((m) => m.id === newMachine.id);
//             if (!prevMachine) return true;
//             return (
//               JSON.stringify(prevMachine.history) !==
//               JSON.stringify(newMachine.history)
//             );
//           });
//           return hasChanges ? newData : prevData;
//         });
//       }
//     } catch (error) {
//       console.error("Lỗi khi lấy dữ liệu từ API:", error);
//     }
//   }, []);

//   useInterval(() => {
//     fetchMachineData();
//   }, 1000);

//   useEffect(() => {
//     fetchMachineData(); // Gọi lần đầu khi mount
//   }, [fetchMachineData]);

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (autoScroll) {
//       timer = setInterval(() => {
//         setCurrentPage((current) => (current >= totalPages ? 1 : current + 1));
//       }, scrollInterval * 1000);
//     }
//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [autoScroll, scrollInterval, totalPages]);

//   useEffect(() => {
//     if (chartRef.current && machinesData.length > 0) {
//       if (!chartInstance.current) {
//         chartInstance.current = echarts.init(chartRef.current);
//       }

//       const baseDate = new Date();
//       baseDate.setHours(6, 0, 0, 0);
//       const startTime = baseDate.getTime();
//       const endTime = startTime + 24 * 3600000; // 6:00 ngày mai
//       const currentTime = new Date().getTime(); // Thời gian thực (ví dụ: 14:38)

//       const startIndex = (currentPage - 1) * machinesPerPage;
//       const categories = machinesData
//         .slice(startIndex, startIndex + machinesPerPage)
//         .map((machine) => `MÁY ${String(machine.id + 1).padStart(2, "0")}`);

//       const data = machinesData
//         .slice(startIndex, startIndex + machinesPerPage)
//         .flatMap((machine, catIndex) => {
//           const timelineData: any = [];
//           let lastEndTime = startTime;

//           // Sắp xếp history theo thời gian
//           const sortedHistory = [...machine.history].sort(
//             (a, b) =>
//               new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
//           );

//           sortedHistory.forEach((record, index) => {
//             const start = new Date(record.timestamp).getTime();
//             if (start > currentTime) return; // Bỏ qua các trạng thái sau thời gian thực

//             const nextRecordTime =
//               index < sortedHistory.length - 1
//                 ? new Date(sortedHistory[index + 1].timestamp).getTime()
//                 : endTime;
//             const end = Math.min(nextRecordTime, currentTime); // Giới hạn đến thời gian thực
//             const duration = end - start;

//             if (start > lastEndTime) {
//               // Thêm khoảng "Máy tắt" nếu có gap trước thời gian thực
//               timelineData.push({
//                 name: "Máy tắt",
//                 value: [
//                   catIndex,
//                   lastEndTime,
//                   Math.min(start, currentTime),
//                   Math.min(start, currentTime) - lastEndTime,
//                 ],
//                 itemStyle: { normal: { color: statusColors.off } },
//               });
//             }

//             const status = record.ma_loi
//               ? errorCodes[record.ma_loi].message
//               : record.status
//               ? "Máy chạy"
//               : "Máy dừng";
//             const color = record.ma_loi
//               ? errorCodes[record.ma_loi].color
//               : record.status
//               ? statusColors.running
//               : statusColors.stopped;

//             timelineData.push({
//               name: status,
//               value: [catIndex, start, end, duration],
//               itemStyle: { normal: { color } },
//             });

//             lastEndTime = end;
//           });

//           // Không thêm "Máy tắt" sau thời gian thực
//           return timelineData;
//         });

//       const renderItem = (params: any, api: any) => {
//         const categoryIndex = api.value(0);
//         const start = api.coord([api.value(1), categoryIndex]);
//         const end = api.coord([api.value(2), categoryIndex]);
//         const height = api.size([0, 1])[1] * 0.6;

//         const rectShape = echarts.graphic.clipRectByRect(
//           {
//             x: start[0],
//             y: start[1] - height / 2,
//             width: end[0] - start[0],
//             height,
//           },
//           {
//             x: params.coordSys.x,
//             y: params.coordSys.y,
//             width: params.coordSys.width,
//             height: params.coordSys.height,
//           }
//         );

//         return (
//           rectShape && {
//             type: "rect",
//             transition: ["shape"],
//             shape: rectShape,
//             style: api.style(),
//           }
//         );
//       };

//       const pad = (number: number) => (number < 10 ? "0" + number : number);
//       const option = {
//         tooltip: {
//           formatter: (params: any) => {
//             const date = new Date(params.value[1]);
//             const endDate = new Date(params.value[2]);
//             return `${params.marker}${params.name}<br/>Bắt đầu: ${pad(
//               date.getHours()
//             )}:${pad(date.getMinutes())}<br/>Kết thúc: ${pad(
//               endDate.getHours()
//             )}:${pad(endDate.getMinutes())}<br/>Thời gian: ${(
//               params.value[3] / 60000
//             ).toFixed(1)} phút`;
//           },
//         },
//         title: {
//           text: "THỐNG KÊ TRẠNG THÁI VÀ LỖI MÁY (06:00 - 06:00)",
//           left: "center",
//           top: 15,
//           textStyle: { fontSize: 25, fontWeight: "bold", color: "#ffffff" },
//         },
//         dataZoom: [
//           {
//             type: "slider",
//             filterMode: "weakFilter",
//             showDataShadow: false,
//             bottom: 20,
//             left: "10%",
//             right: "10%",
//             height: 10,
//             labelFormatter: "",
//             backgroundColor: "#374151",
//             fillerColor: "#60A5FA",
//           },
//           { type: "inside", filterMode: "weakFilter" },
//         ],
//         grid: { height: 750, left: 100, right: 30, top: 70, bottom: 100 },
//         xAxis: {
//           type: "time",
//           min: startTime,
//           max: endTime, // 6:00 ngày mai
//           splitNumber: 24,
//           interval: 3600000,
//           axisLabel: {
//             formatter: (value: number) =>
//               `${pad(new Date(value).getHours())}:00`,
//             interval: 0,
//             textStyle: { fontSize: 14, color: "#D1D5DB" },
//           },
//           splitLine: { show: true, lineStyle: { color: "#374151" } },
//           axisTick: { show: true, alignWithLabel: true, interval: 0 },
//           axisLine: { lineStyle: { color: "#374151" } },
//         },
//         yAxis: {
//           type: "category",
//           data: categories,
//           axisLabel: { textStyle: { fontSize: 14, color: "#D1D5DB" } },
//           axisLine: { lineStyle: { color: "#374151" } },
//         },
//         series: [
//           {
//             type: "custom",
//             renderItem,
//             encode: { x: [1, 2], y: 0 },
//             data,
//           },
//         ],
//       };

//       chartInstance.current.setOption(option, true);

//       const resizeObserver = new ResizeObserver(() => {
//         chartInstance.current?.resize();
//       });
//       resizeObserver.observe(chartRef.current);

//       return () => {
//         resizeObserver.disconnect();
//       };
//     }
//   }, [currentPage, machinesData]);

//   const StatusLegendComponent = () => {
//     const errorItems = [
//       { label: "Đứt sợi trên", color: "#FF0000" },
//       { label: "Đứt sợi dưới", color: "#FFA500" },
//       { label: "Đứt lõi cách điện", color: "#00BFFF" },
//       { label: "Đứt băng nhôm", color: "#FFFF00" },
//       { label: "Lỗi khác", color: "#800080" },
//     ];
//     const statusItems = [
//       { label: "Máy chạy", color: "#008000" },
//       { label: "Máy dừng", color: "#00BFFF" },
//       { label: "Máy tắt", color: "#808080" },
//     ];

//     const LegendItem = ({
//       item,
//     }: {
//       item: { label: string; color: string };
//     }) => (
//       <div className="flex items-center gap-6 transition-transform hover:scale-105">
//         <div
//           className="w-4 h-4 rounded-full"
//           style={{ backgroundColor: item.color }}
//         />
//         <span className="text-lg font-medium text-gray-200">{item.label}</span>
//       </div>
//     );

//     return (
//       <div className="bg-gray-800 p-2 rounded-lg shadow-lg">
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//           {[...statusItems, ...errorItems].map((item, index) => (
//             <LegendItem key={`legend-${index}`} item={item} />
//           ))}
//         </div>
//       </div>
//     );
//   };
//   const StatusLegend = React.memo(StatusLegendComponent);

//   const PaginationComponent = () => {
//     const [input, setInput] = useState(currentPage.toString());

//     const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       const value = e.target.value;
//       if (/^\d*$/.test(value)) setInput(value);
//     };

//     const handlePageSubmit = () => {
//       const newPage = parseInt(input);
//       if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
//         setCurrentPage(newPage);
//       } else {
//         setInput(currentPage.toString());
//       }
//     };

//     useEffect(() => {
//       setInput(currentPage.toString());
//     }, [currentPage]);

//     return (
//       <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-4">
//         <div className="flex items-center gap-3">
//           <label className="flex items-center gap-2 text-gray-200">
//             <input
//               type="checkbox"
//               checked={autoScroll}
//               onChange={(e) => setAutoScroll(e.target.checked)}
//               className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
//             />
//             Tự động chuyển
//           </label>
//           <div className="flex items-center gap-2">
//             <span className="text-gray-200">Thời gian:</span>
//             <input
//               type="number"
//               min="1"
//               max="60"
//               value={scrollInterval}
//               onChange={(e) => setScrollInterval(Number(e.target.value))}
//               className="w-16 p-2 text-center bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <span className="text-gray-200">giây</span>
//           </div>
//         </div>
//         <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-gray-600 pt-3 md:pt-0 md:pl-4">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
//             disabled={currentPage === 1}
//             className="p-2 bg-gray-700 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//           </button>
//           <div className="flex items-center gap-2">
//             <span className="text-gray-200">Trang</span>
//             <input
//               type="text"
//               value={input}
//               onChange={handlePageChange}
//               onBlur={handlePageSubmit}
//               onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
//               className="w-12 p-2 text-center bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <span className="text-gray-200">/{totalPages}</span>
//           </div>
//           <button
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(totalPages, prev + 1))
//             }
//             disabled={currentPage === totalPages}
//             className="p-2 bg-gray-700 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 5l7 7-7 7"
//               />
//             </svg>
//           </button>
//         </div>
//       </div>
//     );
//   };
//   const Pagination = React.memo(PaginationComponent);

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-6">
//       <div className="w-full h-[900px] bg-gray-800 rounded-xl shadow-xl overflow-hidden">
//         <div ref={chartRef} className="w-full h-full" />
//       </div>
//       <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//         <StatusLegend />
//         <Pagination />
//       </div>
//     </div>
//   );
// };

// export default MachineChart;

//!-----------------------------------------

// "use client";
// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useInterval } from "usehooks-ts";
// import * as echarts from "echarts";
// import { api_get_main_data } from "../api";

// type ErrorCode =
//   | "e01"
//   | "e02"
//   | "e03"
//   | "e04"
//   | "e05"
//   | "e06"
//   | "e07"
//   | "e08"
//   | "e09"
//   | "e10"
//   | "e11"
//   | "e12"
//   | "e13";

// type MachineData = {
//   id: number;
//   ip: string;
//   startTime: string;
//   history: {
//     timestamp: string;
//     status: boolean;
//     ma_loi: ErrorCode | null;
//   }[];
// };

// interface ApiNode {
//   ip: string;
//   connection: boolean;
//   data_count: number;
//   last_update: string;
//   data: {
//     ip: string;
//     port: number;
//     connection: boolean;
//     enable: boolean;
//     fps: number;
//     regs: number[];
//     counter_fail: number;
//     last_time_ok: string;
//     start_plc_address: number;
//   }[];
// }

// const statusColors: Record<string, string> = {
//   running: "#008000",
//   stopped: "#00BFFF",
//   off: "#808080",
// };

// const errorCodes: Record<ErrorCode, { message: string; color: string }> = {
//   e01: { message: "Đứt sợi trên", color: "#FF0000" },
//   e02: { message: "Đứt sợi dưới", color: "#FFA500" },
//   e03: { message: "Đứt lõi cách điện", color: "#1E90FF" },
//   e04: { message: "Đứt băng nhôm", color: "#FFFF00" },
//   e05: { message: "Bơm dầu không lên", color: "#800080" },
//   e06: { message: "Mức dầu thấp", color: "#800080" },
//   e07: { message: "Quá tải bơm dầu", color: "#800080" },
//   e08: { message: "Lỗi biến tần", color: "#800080" },
//   e09: { message: "Truyền thông biến tần", color: "#800080" },
//   e10: { message: "Lỗi trục cuốn", color: "#800080" },
//   e11: { message: "Báo động maoci", color: "#800080" },
//   e12: { message: "Cửa mở", color: "#800080" },
//   e13: { message: "Đang dừng khẩn cấp", color: "#800080" },
// };

// const MachineChart = () => {
//   const chartRef = useRef<HTMLDivElement>(null);
//   const chartInstance = useRef<echarts.ECharts | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [autoScroll, setAutoScroll] = useState(false);
//   const [scrollInterval, setScrollInterval] = useState(5);
//   const [machinesData, setMachinesData] = useState<MachineData[]>([]);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const latestDataRef = useRef<MachineData[]>([]);

//   const machinesPerPage = 10;
//   const totalMachines = 200;
//   const totalPages = Math.ceil(totalMachines / machinesPerPage);

//   const deepEqual = useCallback((obj1: any, obj2: any): boolean => {
//     if (obj1 === obj2) return true;
//     if (
//       typeof obj1 !== "object" ||
//       typeof obj2 !== "object" ||
//       obj1 == null ||
//       obj2 == null
//     ) {
//       return false;
//     }
//     const keys1 = Object.keys(obj1);
//     const keys2 = Object.keys(obj2);
//     if (keys1.length !== keys2.length) return false;
//     for (const key of keys1) {
//       if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
//         return false;
//       }
//     }
//     return true;
//   }, []);

//   const getMachineIdFromIp = useCallback((ip: string): number => {
//     const ipParts = ip.split(".");
//     const lastOctet = parseInt(ipParts[3], 10);
//     return lastOctet - 11;
//   }, []);

//   const getErrorCode = useCallback((regs: number[]): ErrorCode | null => {
//     if (!regs || regs.length < 7) {
//       console.log("Dữ liệu regs không đủ (dưới 7 phần tử):", regs);
//       return null;
//     }

//     const reg0 = regs[0] || 0;
//     const reg0Binary = reg0.toString(2).padStart(16, "0");
//     const reg0Bits = reg0Binary.slice(-6);
//     const errorsFromReg0: ErrorCode[] = [];

//     if (reg0Bits[4] === "1") errorsFromReg0.push("e03");
//     if (reg0Bits[5] === "1") errorsFromReg0.push("e04");

//     console.log(
//       `regs[0]=${reg0}, binary=${reg0Binary}, 6 bits cuối=${reg0Bits}, errorsFromReg0=`,
//       errorsFromReg0
//     );

//     const reg6 = regs[6] || 0;
//     const reg6Binary = reg6.toString(2).padStart(16, "0");
//     const reg6Bits = reg6Binary.slice(-11);
//     const errorsFromReg6: ErrorCode[] = [];
//     const errorMap: Record<number, ErrorCode> = {
//       0: "e01",
//       1: "e02",
//       2: "e05",
//       3: "e06",
//       4: "e07",
//       5: "e08",
//       6: "e09",
//       7: "e10",
//       8: "e11",
//       9: "e12",
//       10: "e13",
//     };
//     for (let i = 0; i < 11; i++) {
//       if (reg6Bits[10 - i] === "1") {
//         console.log(
//           `Bit ${i} (reg6Bits[${10 - i}]) = 1, thêm lỗi ${errorMap[i]}`
//         );
//         errorsFromReg6.push(errorMap[i]);
//       }
//     }
//     console.log(
//       `regs[6]=${reg6}, binary=${reg6Binary}, 11 bits cuối=${reg6Bits}, errorsFromReg6=`,
//       errorsFromReg6
//     );

//     const allErrors = [...errorsFromReg6, ...errorsFromReg0];
//     if (allErrors.length === 0) {
//       console.log("Không có lỗi:", allErrors);
//       return null;
//     }

//     const priorityErrors: ErrorCode[] = [
//       "e01",
//       "e02",
//       "e03",
//       "e04",
//       "e05",
//       "e06",
//       "e07",
//       "e08",
//       "e09",
//       "e10",
//       "e11",
//       "e12",
//       "e13",
//     ];
//     const result = allErrors.sort(
//       (a, b) => priorityErrors.indexOf(a) - priorityErrors.indexOf(b)
//     )[0];
//     return result;
//   }, []);

//   const processMachineData = useCallback(
//     (nodes: ApiNode[]): MachineData[] => {
//       const machines: MachineData[] = [];
//       const currentTime = new Date().toISOString();
//       const oneDayMs = 24 * 60 * 60 * 1000;
//       const minUpdateInterval = 5000; // 5 giây
//       const maxHistoryRecords = 100; // Giới hạn 100 bản ghi mỗi máy

//       console.log(
//         "Dữ liệu máy từ API:",
//         nodes.flatMap((node) =>
//           node.data.map((m) => ({
//             ip: m.ip,
//             connection: m.connection,
//             fps: m.fps,
//             reg0: m.regs[0],
//             reg0Binary: m.regs[0]?.toString(2).padStart(16, "0"),
//             bitRunning: m.regs[0]
//               ? m.regs[0].toString(2).padStart(16, "0").slice(-6)[1]
//               : null,
//             bitStopped: m.regs[0]
//               ? m.regs[0].toString(2).padStart(16, "0").slice(-6)[2]
//               : null,
//             reg6: m.regs[6],
//             regs: m.regs,
//           }))
//         )
//       );

//       nodes.forEach((node) => {
//         if (node.connection && node.data && Array.isArray(node.data)) {
//           node.data.forEach((machine) => {
//             if (!machine.ip || !machine.regs) return;

//             const machineId = getMachineIdFromIp(machine.ip);
//             if (machineId < 0 || machineId >= totalMachines) return;

//             const regs = Array.isArray(machine.regs) ? machine.regs : [];
//             const ma_loi = getErrorCode(regs);
//             const timestamp =
//               node.last_update || machine.last_time_ok || currentTime;
//             const startTime =
//               machine.last_time_ok ||
//               new Date().setHours(0, 0, 0, 0).toString();
//             const reg0 = regs[0] || 0;
//             const reg0Binary = reg0.toString(2).padStart(16, "0");
//             const reg0Bits = reg0Binary.slice(-6);

//             let status: boolean;
//             let statusLabel: string;
//             if (!machine.connection) {
//               status = false;
//               statusLabel = "Máy tắt";
//             } else {
//               const bitRunning = reg0Bits[1] === "1";
//               const bitStopped = reg0Bits[2] === "1";
//               if (bitRunning) {
//                 status = true;
//                 statusLabel = "Máy chạy";
//               } else if (bitStopped) {
//                 status = false;
//                 statusLabel = "Máy dừng";
//               } else {
//                 status = false;
//                 statusLabel = "Máy dừng";
//               }
//             }

//             console.log(`Máy ${machineId + 1} (IP: ${machine.ip}):`, {
//               status,
//               statusLabel,
//               ma_loi,
//               connection: machine.connection,
//               bitRunning: reg0Bits[1],
//               bitStopped: reg0Bits[2],
//               reg6: regs[6],
//             });

//             let existingMachine = machines.find((m) => m.id === machineId);
//             if (!existingMachine) {
//               existingMachine = {
//                 id: machineId,
//                 ip: machine.ip,
//                 startTime,
//                 history: [],
//               };
//               machines.push(existingMachine);
//             }

//             const lastRecord =
//               existingMachine.history[existingMachine.history.length - 1];
//             if (
//               !lastRecord ||
//               lastRecord.status !== status ||
//               lastRecord.ma_loi !== ma_loi ||
//               new Date(timestamp).getTime() -
//                 new Date(lastRecord.timestamp).getTime() >=
//                 minUpdateInterval
//             ) {
//               existingMachine.history.push({
//                 timestamp,
//                 status,
//                 ma_loi,
//               });
//               console.log(`Cập nhật history máy ${machineId + 1}:`, {
//                 timestamp,
//                 status,
//                 ma_loi,
//               });
//             } else {
//               console.log(
//                 `Không thay đổi trạng thái máy ${
//                   machineId + 1
//                 }, bỏ qua cập nhật history`
//               );
//             }

//             existingMachine.history = existingMachine.history
//               .filter(
//                 (h) =>
//                   new Date(currentTime).getTime() -
//                     new Date(h.timestamp).getTime() <=
//                   oneDayMs
//               )
//               .slice(-maxHistoryRecords);

//             console.log(
//               `History máy ${machineId + 1}:`,
//               existingMachine.history
//             );
//           });
//         }
//       });

//       for (let i = 0; i < totalMachines; i++) {
//         if (!machines.find((m) => m.id === i)) {
//           machines.push({
//             id: i,
//             ip: `192.168.110.${11 + i}`,
//             startTime: new Date().setHours(0, 0, 0, 0).toString(),
//             history: [{ timestamp: currentTime, status: false, ma_loi: null }],
//           });
//         }
//       }
//       machines.sort((a, b) => a.id - b.id);

//       return machines;
//     },
//     [getErrorCode, getMachineIdFromIp]
//   );

//   const updateMachineData = useCallback(
//     (newData: MachineData[]) => {
//       if (deepEqual(newData, latestDataRef.current)) {
//         console.log("Dữ liệu không thay đổi, bỏ qua cập nhật state");
//         return;
//       }

//       console.log(
//         "Cập nhật machinesData:",
//         newData.map((m) => `MÁY ${String(m.id + 1).padStart(2, "0")}`)
//       );
//       latestDataRef.current = newData;
//       setMachinesData(newData);
//     },
//     [deepEqual]
//   );

//   const fetchMachineData = useCallback(async () => {
//     try {
//       setErrorMessage(null);
//       const res = await api_get_main_data();
//       console.log("API response:", res);

//       let data: any;
//       if (res instanceof Response) {
//         if (!res.ok) {
//           throw new Error(`Lỗi HTTP! Status: ${res.status}`);
//         }
//         const contentType = res.headers.get("content-type");
//         if (!contentType || !contentType.includes("application/json")) {
//           const text = await res.text();
//           console.error("Phản hồi không phải JSON:", contentType, text);
//           throw new Error(`Expected JSON, but received ${contentType}`);
//         }
//         data = await res.json();
//       } else {
//         data = res;
//       }

//       console.log("API JSON data:", data);

//       let nodes: ApiNode[] = [];
//       if (Array.isArray(data)) {
//         nodes = data;
//       } else if (data && typeof data === "object") {
//         const possibleKeys = ["nodes", "data", "result", "machines"];
//         const foundKey = possibleKeys.find((key) => Array.isArray(data[key]));
//         if (foundKey) {
//           nodes = data[foundKey];
//         } else {
//           throw new Error("Dữ liệu không chứa mảng node");
//         }
//       } else {
//         throw new Error("Dữ liệu không phải mảng hoặc object");
//       }

//       const processedData = processMachineData(nodes);
//       updateMachineData(processedData);
//     } catch (error) {
//       console.error("Lỗi khi lấy dữ liệu:", error);
//       setErrorMessage(
//         error instanceof Error ? error.message : "Không thể lấy dữ liệu từ API"
//       );
//     }
//   }, [processMachineData, updateMachineData]);

//   useInterval(() => {
//     fetchMachineData();
//   }, 1000);

//   useEffect(() => {
//     fetchMachineData();
//   }, [fetchMachineData]);

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (autoScroll && machinesData.length > 0 && totalPages > 1) {
//       timer = setInterval(() => {
//         setCurrentPage((current) => {
//           const nextPage = current >= totalPages ? 1 : current + 1;
//           return nextPage;
//         });
//       }, scrollInterval * 1000);
//     }
//     return () => {
//       if (timer) {
//         clearInterval(timer);
//       }
//     };
//   }, [autoScroll, scrollInterval, totalPages, machinesData.length]);

//   useEffect(() => {
//     if (!chartRef.current || machinesData.length === 0 || errorMessage) {
//       return;
//     }

//     try {
//       if (!chartInstance.current) {
//         chartInstance.current = echarts.init(chartRef.current);
//       }

//       const baseDate = new Date();
//       baseDate.setHours(6, 0, 0, 0);
//       const startTime = baseDate.getTime();
//       const endTime = startTime + 24 * 3600000;
//       const currentTime = new Date().getTime();

//       const startIndex = (currentPage - 1) * machinesPerPage;
//       const categories = machinesData
//         .slice(startIndex, startIndex + machinesPerPage)
//         .map((machine) => `MÁY ${String(machine.id + 1).padStart(2, "0")}`);

//       const maxHistoryRecords = 100;
//       const data = machinesData
//         .slice(startIndex, startIndex + machinesPerPage)
//         .flatMap((machine, catIndex) => {
//           const timelineData: any = [];
//           let lastEndTime = startTime;

//           const sortedHistory = [...machine.history]
//             .sort(
//               (a, b) =>
//                 new Date(a.timestamp).getTime() -
//                 new Date(b.timestamp).getTime()
//             )
//             .slice(-maxHistoryRecords);

//           sortedHistory.forEach((record, index) => {
//             const start = new Date(record.timestamp).getTime();
//             if (start > currentTime) return;

//             const nextRecordTime =
//               index < sortedHistory.length - 1
//                 ? new Date(sortedHistory[index + 1].timestamp).getTime()
//                 : endTime;
//             const end = Math.min(nextRecordTime, currentTime);
//             const duration = end - start;

//             if (start > lastEndTime) {
//               timelineData.push({
//                 name: "Máy tắt",
//                 value: [
//                   catIndex,
//                   lastEndTime,
//                   Math.min(start, currentTime),
//                   Math.min(start, currentTime) - lastEndTime,
//                 ],
//                 itemStyle: { normal: { color: statusColors.off } },
//               });
//             }

//             const status = record.status
//               ? "Máy chạy"
//               : record.ma_loi
//               ? errorCodes[record.ma_loi].message
//               : "Máy dừng";
//             const color = record.status
//               ? statusColors.running
//               : record.ma_loi
//               ? errorCodes[record.ma_loi].color
//               : statusColors.stopped;

//             console.log(`Timeline máy ${machine.id + 1}:`, {
//               timestamp: record.timestamp,
//               status,
//               color,
//               ma_loi: record.ma_loi,
//               start: new Date(start).toISOString(),
//               end: new Date(end).toISOString(),
//             });

//             timelineData.push({
//               name: status,
//               value: [catIndex, start, end, duration],
//               itemStyle: { normal: { color } },
//               errorMessage: record.ma_loi
//                 ? errorCodes[record.ma_loi].message
//                 : null,
//             });

//             lastEndTime = end;
//           });

//           return timelineData;
//         });

//       console.log(`Dữ liệu biểu đồ trang ${currentPage}:`, {
//         categories,
//         dataLength: data.length,
//         timelineData: data.map((item) => ({
//           name: item.name,
//           color: item.itemStyle.normal.color,
//           start: new Date(item.value[1]).toISOString(),
//           end: new Date(item.value[2]).toISOString(),
//           errorMessage: item.errorMessage,
//         })),
//       });

//       const renderItem = (params: any, api: any) => {
//         const categoryIndex = api.value(0);
//         const start = api.coord([api.value(1), categoryIndex]);
//         const end = api.coord([api.value(2), categoryIndex]);
//         const height = api.size([0, 1])[1] * 0.6;

//         const rectShape = echarts.graphic.clipRectByRect(
//           {
//             x: start[0],
//             y: start[1] - height / 2,
//             width: end[0] - start[0],
//             height,
//           },
//           {
//             x: params.coordSys.x,
//             y: params.coordSys.y,
//             width: params.coordSys.width,
//             height: params.coordSys.height,
//           }
//         );

//         return (
//           rectShape && {
//             type: "rect",
//             transition: ["shape"],
//             shape: rectShape,
//             style: api.style(),
//           }
//         );
//       };

//       const pad = (number: number) => (number < 10 ? "0" + number : number);
//       const option = {
//         tooltip: {
//           formatter: (params: any) => {
//             const date = new Date(params.value[1]);
//             const endDate = new Date(params.value[2]);
//             const errorText = params.data.errorMessage
//               ? `<br/>Lỗi: ${params.data.errorMessage}`
//               : "";
//             return `${params.marker}${
//               params.name
//             }${errorText}<br/>Bắt đầu: ${pad(date.getHours())}:${pad(
//               date.getMinutes()
//             )}<br/>Kết thúc: ${pad(endDate.getHours())}:${pad(
//               endDate.getMinutes()
//             )}<br/>Thời gian: ${(params.value[3] / 60000).toFixed(1)} phút`;
//           },
//         },
//         title: {
//           text: "THỐNG KÊ TRẠNG THÁI VÀ LỖI MÁY (06:00 - 06:00)",
//           left: "center",
//           top: 15,
//           textStyle: { fontSize: 25, fontWeight: "bold", color: "#ffffff" },
//         },
//         dataZoom: [
//           {
//             type: "slider",
//             filterMode: "weakFilter",
//             showDataShadow: false,
//             bottom: 20,
//             left: "10%",
//             right: "10%",
//             height: 10,
//             labelFormatter: "",
//             backgroundColor: "#374151",
//             fillerColor: "#60A5FA",
//           },
//           { type: "inside", filterMode: "weakFilter" },
//         ],
//         grid: { height: 750, left: 100, right: 30, top: 70, bottom: 100 },
//         xAxis: {
//           type: "time",
//           min: startTime,
//           max: endTime,
//           splitNumber: 24,
//           interval: 3600000,
//           axisLabel: {
//             formatter: (value: number) =>
//               `${pad(new Date(value).getHours())}:00`,
//             interval: 0,
//             textStyle: { fontSize: 14, color: "#D1D5DB" },
//           },
//           splitLine: { show: true, lineStyle: { color: "#374151" } },
//           axisTick: { show: true, alignWithLabel: true, interval: 0 },
//           axisLine: { lineStyle: { color: "#374151" } },
//         },
//         yAxis: {
//           type: "category",
//           data: categories,
//           axisLabel: { textStyle: { fontSize: 14, color: "#D1D5DB" } },
//           axisLine: { lineStyle: { color: "#374151" } },
//         },
//         series: [
//           {
//             type: "custom",
//             renderItem,
//             encode: { x: [1, 2], y: 0 },
//             data,
//           },
//         ],
//       };

//       chartInstance.current.setOption(option, true);

//       const resizeObserver = new ResizeObserver(() => {
//         chartInstance.current?.resize();
//       });
//       resizeObserver.observe(chartRef.current);

//       return () => {
//         resizeObserver.disconnect();
//         if (chartInstance.current) {
//           chartInstance.current.dispose();
//           chartInstance.current = null;
//         }
//       };
//     } catch (error) {
//       console.error("Lỗi khởi tạo hoặc cập nhật biểu đồ:", error);
//     }
//   }, [currentPage, machinesData, errorMessage]);

//   const StatusLegendComponent = () => {
//     const errorItems = [
//       { label: "Đứt sợi trên", color: "#FF0000" },
//       { label: "Đứt sợi dưới", color: "#FFA500" },
//       { label: "Đứt lõi cách điện", color: "#1E90FF" },
//       { label: "Đứt băng nhôm", color: "#FFFF00" },
//       { label: "Lỗi khác", color: "#800080" },
//     ];
//     const statusItems = [
//       { label: "Máy chạy", color: "#008000" },
//       { label: "Máy dừng", color: "#00BFFF" },
//       { label: "Máy tắt", color: "#808080" },
//     ];

//     const LegendItem = ({
//       item,
//     }: {
//       item: { label: string; color: string };
//     }) => (
//       <div className="flex items-center gap-6 transition-transform hover:scale-105">
//         <div
//           className="w-4 h-4 rounded-full"
//           style={{ backgroundColor: item.color }}
//         />
//         <span className="text-lg font-medium text-gray-200">{item.label}</span>
//       </div>
//     );

//     return (
//       <div className="bg-gray-800 p-2 rounded-lg shadow-lg">
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//           {[...statusItems, ...errorItems].map((item, index) => (
//             <LegendItem key={`legend-${index}`} item={item} />
//           ))}
//         </div>
//       </div>
//     );
//   };
//   const StatusLegend = React.memo(StatusLegendComponent);

//   const PaginationComponent = () => {
//     const [input, setInput] = useState(currentPage.toString());
//     const pageInputRef = useRef<HTMLInputElement>(null);
//     const intervalInputRef = useRef<HTMLInputElement>(null);
//     const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//     const debounce = useCallback((func: () => void, wait: number) => {
//       return () => {
//         if (timeoutRef.current) clearTimeout(timeoutRef.current);
//         timeoutRef.current = setTimeout(func, wait);
//       };
//     }, []);

//     const handlePageChange = useCallback(
//       (e: React.ChangeEvent<HTMLInputElement>) => {
//         const value = e.target.value;
//         if (/^\d*$/.test(value)) {
//           setInput(value);
//         }
//       },
//       []
//     );

//     const handlePageSubmit = useCallback(() => {
//       const newPage = parseInt(input);
//       if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
//         setCurrentPage(newPage);
//       } else {
//         setInput(currentPage.toString());
//       }
//     }, [input, currentPage]);

//     const debouncedPageSubmit = debounce(handlePageSubmit, 150);

//     useEffect(() => {
//       setInput(currentPage.toString());
//     }, [currentPage]);

//     useEffect(() => {
//       const focusInput = () => {
//         if (document.activeElement === pageInputRef.current) {
//           pageInputRef.current?.focus();
//         } else if (document.activeElement === intervalInputRef.current) {
//           intervalInputRef.current?.focus();
//         }
//       };
//       focusInput();
//       window.addEventListener("focusin", focusInput);
//       return () => window.removeEventListener("focusin", focusInput);
//     }, []);

//     return (
//       <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-4">
//         <div className="flex items-center gap-3">
//           <label className="flex items-center gap-2 text-gray-200">
//             <input
//               type="checkbox"
//               checked={autoScroll}
//               onChange={(e) => setAutoScroll(e.target.checked)}
//               className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
//             />
//             Tự động chuyển
//           </label>
//           <div className="flex items-center gap-2">
//             <span className="text-gray-200">Thời gian:</span>
//             <input
//               ref={intervalInputRef}
//               type="number"
//               min="1"
//               max="60"
//               value={scrollInterval}
//               onChange={(e) => setScrollInterval(Number(e.target.value))}
//               onTouchStart={(e) => e.currentTarget.focus()}
//               onFocus={(e) => e.currentTarget.select()}
//               className="w-16 p-2 text-center bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <span className="text-gray-200">giây</span>
//           </div>
//         </div>
//         <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-gray-600 pt-3 md:pt-0 md:pl-4">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
//             disabled={currentPage === 1}
//             className="p-2 bg-gray-700 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//           </button>
//           <div className="flex items-center gap-2">
//             <span className="text-gray-200">Trang</span>
//             <input
//               ref={pageInputRef}
//               type="text"
//               value={input}
//               onChange={(e) => {
//                 handlePageChange(e);
//                 debouncedPageSubmit();
//               }}
//               onBlur={handlePageSubmit}
//               onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
//               onTouchStart={(e) => e.currentTarget.focus()}
//               onFocus={(e) => e.currentTarget.select()}
//               className="w-16 p-2 text-center bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <span className="text-gray-200">/{totalPages}</span>
//           </div>
//           <button
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(totalPages, prev + 1))
//             }
//             disabled={currentPage === totalPages}
//             className="p-2 bg-gray-700 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 5l7 7-7 7"
//               />
//             </svg>
//           </button>
//         </div>
//       </div>
//     );
//   };
//   const Pagination = React.memo(PaginationComponent);

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-6">
//       {errorMessage && (
//         <div className="mb-4 p-4 bg-red-600 text-white rounded-lg">
//           <p>Lỗi: {errorMessage}</p>
//           <p>Không thể tải dữ liệu biểu đồ. Vui lòng kiểm tra kết nối API.</p>
//         </div>
//       )}
//       <div className="w-full h-[900px] bg-gray-800 rounded-xl shadow-xl overflow-hidden">
//         {machinesData.length > 0 ? (
//           <div ref={chartRef} className="w-full h-full" />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-gray-400">
//             Đang tải dữ liệu biểu đồ...
//           </div>
//         )}
//       </div>
//       <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//         <StatusLegend />
//         <Pagination />
//       </div>
//     </div>
//   );
// };

// export default MachineChart;

//!-----------------------------------------------------
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useInterval } from "usehooks-ts";
import * as echarts from "echarts";
import { api_get_main_data } from "../api";

type ErrorCode =
  | "e01"
  | "e02"
  | "e03"
  | "e04"
  | "e05"
  | "e06"
  | "e07"
  | "e08"
  | "e09"
  | "e10"
  | "e11"
  | "e12"
  | "e13";

type MachineData = {
  id: number;
  ip: string;
  startTime: string;
  history: {
    timestamp: string;
    status: boolean;
    ma_loi: ErrorCode | null;
  }[];
};

interface ApiNode {
  ip: string;
  connection: boolean;
  data_count: number;
  last_update: string;
  data: {
    ip: string;
    port: number;
    connection: boolean;
    enable: boolean;
    fps: number;
    regs: number[];
    counter_fail: number;
    last_time_ok: string;
    start_plc_address: number;
  }[];
}

const statusColors: Record<string, string> = {
  running: "#008000",
  stopped: "#00BFFF",
  off: "#808080",
};

const errorCodes: Record<ErrorCode, { message: string; color: string }> = {
  e01: { message: "Đứt sợi trên", color: "#FF0000" },
  e02: { message: "Đứt sợi dưới", color: "#FFA500" },
  e03: { message: "Đứt lõi cách điện", color: "#1E90FF" },
  e04: { message: "Đứt băng nhôm", color: "#FFFF00" },
  e05: { message: "Bơm dầu không lên", color: "#800080" },
  e06: { message: "Mức dầu thấp", color: "#800080" },
  e07: { message: "Quá tải bơm dầu", color: "#800080" },
  e08: { message: "Lỗi biến tần", color: "#800080" },
  e09: { message: "Truyền thông biến tần", color: "#800080" },
  e10: { message: "Lỗi trục cuốn", color: "#800080" },
  e11: { message: "Báo động maoci", color: "#800080" },
  e12: { message: "Cửa mở", color: "#800080" },
  e13: { message: "Đang dừng khẩn cấp", color: "#800080" },
};

const MachineChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollInterval, setScrollInterval] = useState(5);
  const [machinesData, setMachinesData] = useState<MachineData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestDataRef = useRef<MachineData[]>([]);

  const machinesPerPage = 10;
  const totalMachines = 200;
  const totalPages = Math.ceil(totalMachines / machinesPerPage);

  const deepEqual = useCallback((obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (
      typeof obj1 !== "object" ||
      typeof obj2 !== "object" ||
      obj1 == null ||
      obj2 == null
    ) {
      return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;
    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }, []);

  const getMachineIdFromIp = useCallback((ip: string): number => {
    const ipParts = ip.split(".");
    const lastOctet = parseInt(ipParts[3], 10);
    return lastOctet - 11;
  }, []);

  const getErrorCode = useCallback((regs: number[]): ErrorCode | null => {
    if (!regs || regs.length < 7) {
      console.log("Dữ liệu regs không đủ (dưới 7 phần tử):", regs);
      return null;
    }

    const reg0 = regs[0] || 0;
    const reg0Binary = reg0.toString(2).padStart(16, "0");
    const reg0Bits = reg0Binary.slice(-6);
    const errorsFromReg0: ErrorCode[] = [];

    if (reg0Bits[4] === "1") errorsFromReg0.push("e03");
    if (reg0Bits[5] === "1") errorsFromReg0.push("e04");

    console.log(
      `regs[0]=${reg0}, binary=${reg0Binary}, 6 bits cuối=${reg0Bits}, errorsFromReg0=`,
      errorsFromReg0
    );

    const reg6 = regs[6] || 0;
    const reg6Binary = reg6.toString(2).padStart(16, "0");
    const reg6Bits = reg6Binary.slice(-11);
    const errorsFromReg6: ErrorCode[] = [];
    const errorMap: Record<number, ErrorCode> = {
      0: "e01",
      1: "e02",
      2: "e05",
      3: "e06",
      4: "e07",
      5: "e08",
      6: "e09",
      7: "e10",
      8: "e11",
      9: "e12",
      10: "e13",
    };
    for (let i = 0; i < 11; i++) {
      if (reg6Bits[10 - i] === "1") {
        console.log(
          `Bit ${i} (reg6Bits[${10 - i}]) = 1, thêm lỗi ${errorMap[i]}`
        );
        errorsFromReg6.push(errorMap[i]);
      }
    }
    console.log(
      `regs[6]=${reg6}, binary=${reg6Binary}, 11 bits cuối=${reg6Bits}, errorsFromReg6=`,
      errorsFromReg6
    );

    const allErrors = [...errorsFromReg6, ...errorsFromReg0];
    if (allErrors.length === 0) {
      console.log("Không có lỗi:", allErrors);
      return null;
    }

    const priorityErrors: ErrorCode[] = [
      "e01",
      "e02",
      "e03",
      "e04",
      "e05",
      "e06",
      "e07",
      "e08",
      "e09",
      "e10",
      "e11",
      "e12",
      "e13",
    ];
    const result = allErrors.sort(
      (a, b) => priorityErrors.indexOf(a) - priorityErrors.indexOf(b)
    )[0];
    return result;
  }, []);

  const processMachineData = useCallback(
    (nodes: ApiNode[]): MachineData[] => {
      const machines: MachineData[] = [];
      const currentTime = new Date().toISOString();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const maxHistoryRecords = 100; // Giới hạn 100 bản ghi mỗi máy

      console.log(
        "Dữ liệu máy từ API:",
        nodes.flatMap((node) =>
          node.data.map((m) => ({
            ip: m.ip,
            connection: m.connection,
            fps: m.fps,
            reg0: m.regs[0],
            reg0Binary: m.regs[0]?.toString(2).padStart(16, "0"),
            bitRunning: m.regs[0]
              ? m.regs[0].toString(2).padStart(16, "0").slice(-6)[1]
              : null,
            bitStopped: m.regs[0]
              ? m.regs[0].toString(2).padStart(16, "0").slice(-6)[2]
              : null,
            reg6: m.regs[6],
            regs: m.regs,
          }))
        )
      );

      nodes.forEach((node) => {
        if (node.connection && node.data && Array.isArray(node.data)) {
          node.data.forEach((machine) => {
            if (!machine.ip || !machine.regs) return;

            const machineId = getMachineIdFromIp(machine.ip);
            if (machineId < 0 || machineId >= totalMachines) return;

            const regs = Array.isArray(machine.regs) ? machine.regs : [];
            const ma_loi = getErrorCode(regs);
            const timestamp =
              machine.last_time_ok || node.last_update || currentTime;
            const startTime =
              machine.last_time_ok ||
              new Date().setHours(0, 0, 0, 0).toString();
            const reg0 = regs[0] || 0;
            const reg0Binary = reg0.toString(2).padStart(16, "0");
            const reg0Bits = reg0Binary.slice(-6);

            let status: boolean;
            let statusLabel: string;
            if (!machine.connection) {
              status = false;
              statusLabel = "Máy tắt";
            } else {
              const bitRunning = reg0Bits[1] === "1";
              const bitStopped = reg0Bits[2] === "1";
              if (bitRunning) {
                status = true;
                statusLabel = "Máy chạy";
              } else if (bitStopped) {
                status = false;
                statusLabel = "Máy dừng";
              } else {
                status = false;
                statusLabel = ma_loi ? errorCodes[ma_loi].message : "Máy dừng";
              }
            }

            console.log(`Máy ${machineId + 1} (IP: ${machine.ip}):`, {
              status,
              statusLabel,
              ma_loi,
              connection: machine.connection,
              bitRunning: reg0Bits[1],
              bitStopped: reg0Bits[2],
              reg6: regs[6],
              timestamp,
            });

            let existingMachine = machines.find((m) => m.id === machineId);
            if (!existingMachine) {
              existingMachine = {
                id: machineId,
                ip: machine.ip,
                startTime,
                history: [],
              };
              machines.push(existingMachine);
            }

            const lastRecord =
              existingMachine.history[existingMachine.history.length - 1];
            if (
              !lastRecord ||
              lastRecord.status !== status ||
              lastRecord.ma_loi !== ma_loi
            ) {
              existingMachine.history.push({
                timestamp,
                status,
                ma_loi,
              });
              console.log(`Cập nhật history máy ${machineId + 1}:`, {
                timestamp,
                status,
                ma_loi,
              });
            } else {
              console.log(
                `Không thay đổi trạng thái máy ${
                  machineId + 1
                }, bỏ qua cập nhật history`
              );
            }

            existingMachine.history = existingMachine.history
              .filter(
                (h) =>
                  new Date(currentTime).getTime() -
                    new Date(h.timestamp).getTime() <=
                  oneDayMs
              )
              .slice(-maxHistoryRecords);

            console.log(
              `History máy ${machineId + 1}:`,
              existingMachine.history
            );
          });
        }
      });

      for (let i = 0; i < totalMachines; i++) {
        if (!machines.find((m) => m.id === i)) {
          machines.push({
            id: i,
            ip: `192.168.110.${11 + i}`,
            startTime: new Date().setHours(0, 0, 0, 0).toString(),
            history: [{ timestamp: currentTime, status: false, ma_loi: null }],
          });
        }
      }
      machines.sort((a, b) => a.id - b.id);

      return machines;
    },
    [getErrorCode, getMachineIdFromIp]
  );

  const updateMachineData = useCallback(
    (newData: MachineData[]) => {
      if (deepEqual(newData, latestDataRef.current)) {
        console.log("Dữ liệu không thay đổi, bỏ qua cập nhật state");
        return;
      }

      console.log(
        "Cập nhật machinesData:",
        newData.map((m) => `MÁY ${String(m.id + 1).padStart(2, "0")}`)
      );
      latestDataRef.current = newData;
      setMachinesData(newData);
    },
    [deepEqual]
  );

  const fetchMachineData = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await api_get_main_data();
      console.log("API response:", res);

      let data: any;
      if (res instanceof Response) {
        if (!res.ok) {
          throw new Error(`Lỗi HTTP! Status: ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Phản hồi không phải JSON:", contentType, text);
          throw new Error(`Expected JSON, but received ${contentType}`);
        }
        data = await res.json();
      } else {
        data = res;
      }

      console.log("API JSON data:", data);

      let nodes: ApiNode[] = [];
      if (Array.isArray(data)) {
        nodes = data;
      } else if (data && typeof data === "object") {
        const possibleKeys = ["nodes", "data", "result", "machines"];
        const foundKey = possibleKeys.find((key) => Array.isArray(data[key]));
        if (foundKey) {
          nodes = data[foundKey];
        } else {
          throw new Error("Dữ liệu không chứa mảng node");
        }
      } else {
        throw new Error("Dữ liệu không phải mảng hoặc object");
      }

      const processedData = processMachineData(nodes);
      updateMachineData(processedData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể lấy dữ liệu từ API"
      );
    }
  }, [processMachineData, updateMachineData]);

  useInterval(() => {
    fetchMachineData();
  }, 1000);

  useEffect(() => {
    fetchMachineData();
  }, [fetchMachineData]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoScroll && machinesData.length > 0 && totalPages > 1) {
      timer = setInterval(() => {
        setCurrentPage((current) => {
          const nextPage = current >= totalPages ? 1 : current + 1;
          return nextPage;
        });
      }, scrollInterval * 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [autoScroll, scrollInterval, totalPages, machinesData.length]);

  useEffect(() => {
    if (!chartRef.current || machinesData.length === 0 || errorMessage) {
      return;
    }

    try {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const baseDate = new Date();
      baseDate.setHours(6, 0, 0, 0);
      const startTime = baseDate.getTime();
      const endTime = startTime + 24 * 3600000;
      const currentTime = new Date().getTime();

      const startIndex = (currentPage - 1) * machinesPerPage;
      const categories = machinesData
        .slice(startIndex, startIndex + machinesPerPage)
        .map((machine) => `MÁY ${String(machine.id + 1).padStart(2, "0")}`);

      const maxHistoryRecords = 100;
      const data = machinesData
        .slice(startIndex, startIndex + machinesPerPage)
        .flatMap((machine, catIndex) => {
          const timelineData: any = [];
          let lastEndTime = startTime;

          const sortedHistory = [...machine.history]
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            )
            .slice(-maxHistoryRecords);

          sortedHistory.forEach((record, index) => {
            const start = new Date(record.timestamp).getTime();
            if (start > currentTime) return;

            const nextRecordTime =
              index < sortedHistory.length - 1
                ? new Date(sortedHistory[index + 1].timestamp).getTime()
                : endTime;
            const end = Math.min(nextRecordTime, currentTime);
            const duration = end - start;

            if (start > lastEndTime) {
              timelineData.push({
                name: "Máy tắt",
                value: [
                  catIndex,
                  lastEndTime,
                  Math.min(start, currentTime),
                  Math.min(start, currentTime) - lastEndTime,
                ],
                itemStyle: { normal: { color: statusColors.off } },
              });
            }

            const status = record.ma_loi
              ? errorCodes[record.ma_loi].message
              : record.status
              ? "Máy chạy"
              : "Máy dừng";
            const color = record.ma_loi
              ? errorCodes[record.ma_loi].color
              : record.status
              ? statusColors.running
              : statusColors.stopped;

            console.log(`Timeline máy ${machine.id + 1}:`, {
              timestamp: record.timestamp,
              status,
              color,
              ma_loi: record.ma_loi,
              start: new Date(start).toISOString(),
              end: new Date(end).toISOString(),
            });

            timelineData.push({
              name: status,
              value: [catIndex, start, end, duration],
              itemStyle: { normal: { color } },
              errorMessage: record.ma_loi
                ? errorCodes[record.ma_loi].message
                : null,
            });

            lastEndTime = end;
          });

          return timelineData;
        });

      console.log(`Dữ liệu biểu đồ trang ${currentPage}:`, {
        categories,
        dataLength: data.length,
        timelineData: data.map((item) => ({
          name: item.name,
          color: item.itemStyle.normal.color,
          start: new Date(item.value[1]).toISOString(),
          end: new Date(item.value[2]).toISOString(),
          errorMessage: item.errorMessage,
        })),
      });

      const renderItem = (params: any, api: any) => {
        const categoryIndex = api.value(0);
        const start = api.coord([api.value(1), categoryIndex]);
        const end = api.coord([api.value(2), categoryIndex]);
        const height = api.size([0, 1])[1] * 0.6;

        const rectShape = echarts.graphic.clipRectByRect(
          {
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height,
          },
          {
            x: params.coordSys.x,
            y: params.coordSys.y,
            width: params.coordSys.width,
            height: params.coordSys.height,
          }
        );

        return (
          rectShape && {
            type: "rect",
            transition: ["shape"],
            shape: rectShape,
            style: api.style(),
          }
        );
      };

      const pad = (number: number) => (number < 10 ? "0" + number : number);
      const option = {
        tooltip: {
          formatter: (params: any) => {
            const date = new Date(params.value[1]);
            const endDate = new Date(params.value[2]);
            const errorText = params.data.errorMessage
              ? `<br/>Lỗi: ${params.data.errorMessage}`
              : "";
            return `${params.marker}${
              params.name
            }${errorText}<br/>Bắt đầu: ${pad(date.getHours())}:${pad(
              date.getMinutes()
            )}:${pad(date.getSeconds())}<br/>Kết thúc: ${pad(
              endDate.getHours()
            )}:${pad(endDate.getMinutes())}:${pad(
              endDate.getSeconds()
            )}<br/>Thời gian: ${(params.value[3] / 60000).toFixed(1)} phút`;
          },
        },
        title: {
          text: "BIỂU ĐỒ TIMELINE TRẠNG THÁI MÁY",
          left: "center",
          top: 15,
          textStyle: {
            fontSize: 30,
            fontWeight: "bold",
            color: "#ffffff",
            fontFamily: "sans-serif",
          },
        },

        dataZoom: [
          {
            type: "slider",
            filterMode: "weakFilter",
            showDataShadow: false,
            bottom: 20,
            left: "10%",
            right: "10%",
            height: 7,
            labelFormatter: "",
            backgroundColor: "#374151",
            fillerColor: "#60A5FA",
            show: false,
          },
          { type: "inside", filterMode: "weakFilter" },
        ],
        grid: { height: 790, left: 100, right: 30, top: 70, bottom: 100 },
        xAxis: {
          type: "time",
          min: startTime,
          max: endTime,
          splitNumber: 24,
          interval: 3600000,
          axisLabel: {
            formatter: (value: number) =>
              `${pad(new Date(value).getHours())}:00`,
            interval: 0,
            textStyle: { fontSize: 14, color: "#D1D5DB" },
          },
          splitLine: { show: true, lineStyle: { color: "#374151" } },
          axisTick: { show: true, alignWithLabel: true, interval: 0 },
          axisLine: { lineStyle: { color: "#374151" } },
        },
        yAxis: {
          type: "category",
          data: categories,
          axisLabel: { textStyle: { fontSize: 14, color: "#D1D5DB" } },
          axisLine: { lineStyle: { color: "#374151" } },
        },
        series: [
          {
            type: "custom",
            renderItem,
            encode: { x: [1, 2], y: 0 },
            data,
          },
        ],
      };

      chartInstance.current.setOption(option, true);

      const resizeObserver = new ResizeObserver(() => {
        chartInstance.current?.resize();
      });
      resizeObserver.observe(chartRef.current);

      return () => {
        resizeObserver.disconnect();
        if (chartInstance.current) {
          chartInstance.current.dispose();
          chartInstance.current = null;
        }
      };
    } catch (error) {
      console.error("Lỗi khởi tạo hoặc cập nhật biểu đồ:", error);
    }
  }, [currentPage, machinesData, errorMessage]);

  const StatusLegendComponent = () => {
    const errorItems = [
      { label: "Đứt sợi trên", color: "#FF0000" },
      { label: "Đứt sợi dưới", color: "#FFA500" },
      { label: "Đứt lõi cách điện", color: "#1E90FF" },
      { label: "Đứt băng nhôm", color: "#FFFF00" },
      { label: "Lỗi khác", color: "#800080" },
    ];
    const statusItems = [
      { label: "Máy chạy", color: "#008000" },
      { label: "Máy dừng", color: "#00BFFF" },
      { label: "Máy tắt", color: "#808080" },
    ];

    const LegendItem = ({
      item,
    }: {
      item: { label: string; color: string };
    }) => (
      <div className="flex items-center gap-6 transition-transform hover:scale-105">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-lg font-medium text-gray-200">{item.label}</span>
      </div>
    );

    return (
      <div className="bg-gray-800 p-2 rounded-lg shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...statusItems, ...errorItems].map((item, index) => (
            <LegendItem key={`legend-${index}`} item={item} />
          ))}
        </div>
      </div>
    );
  };
  const StatusLegend = React.memo(StatusLegendComponent);

  const PaginationComponent = () => {
    const [input, setInput] = useState(currentPage.toString());
    const pageInputRef = useRef<HTMLInputElement>(null);
    const intervalInputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debounce = useCallback((func: () => void, wait: number) => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(func, wait);
      };
    }, []);

    const handlePageChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
          setInput(value);
        }
      },
      []
    );

    const handlePageSubmit = useCallback(() => {
      const newPage = parseInt(input);
      if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      } else {
        setInput(currentPage.toString());
      }
    }, [input, currentPage]);

    const debouncedPageSubmit = debounce(handlePageSubmit, 150);

    useEffect(() => {
      setInput(currentPage.toString());
    }, [currentPage]);

    useEffect(() => {
      const focusInput = () => {
        if (document.activeElement === pageInputRef.current) {
          pageInputRef.current?.focus();
        } else if (document.activeElement === intervalInputRef.current) {
          intervalInputRef.current?.focus();
        }
      };
      focusInput();
      window.addEventListener("focusin", focusInput);
      return () => window.removeEventListener("focusin", focusInput);
    }, []);

    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-gray-200">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            Tự động chuyển
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-200">Thời gian:</span>
            <input
              ref={intervalInputRef}
              type="number"
              min="1"
              max="60"
              value={scrollInterval}
              onChange={(e) => setScrollInterval(Number(e.target.value))}
              onTouchStart={(e) => e.currentTarget.focus()}
              onFocus={(e) => e.currentTarget.select()}
              className="w-16 p-2 text-center bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-200">giây</span>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-gray-600 pt-3 md:pt-0 md:pl-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-gray-700 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-gray-200">Trang</span>
            <input
              ref={pageInputRef}
              type="text"
              value={input}
              onChange={(e) => {
                handlePageChange(e);
                debouncedPageSubmit();
              }}
              onBlur={handlePageSubmit}
              onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
              onTouchStart={(e) => e.currentTarget.focus()}
              onFocus={(e) => e.currentTarget.select()}
              className="w-16 p-2 text-center bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-200">/{totalPages}</span>
          </div>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-700 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  const Pagination = React.memo(PaginationComponent);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-600 text-white rounded-lg">
          <p>Lỗi: {errorMessage}</p>
          <p>Không thể tải dữ liệu biểu đồ. Vui lòng kiểm tra kết nối API.</p>
        </div>
      )}
      <div className="w-full h-[900px] bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        {machinesData.length > 0 ? (
          <div ref={chartRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Đang tải dữ liệu biểu đồ...
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <StatusLegend />
        <Pagination />
      </div>
    </div>
  );
};

export default MachineChart;

// "use client";
// import React, { useState, useMemo } from "react";
// import { useInterval } from "usehooks-ts";
// import Link from "next/link";
// import ReactECharts from "echarts-for-react";
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
//   status: boolean;
//   fps: number;
//   so_met_dat: number;
//   so_met_thuc: number;
//   toc_do_dat: number;
//   toc_do_thuc: number;
//   hieu_suat: number;
//   ma_loi: ErrorCode | null;
//   regs: number[];
// };

// const errorCodes: Record<string, { message: string; color: string }> = {
//   e01: { message: "Đứt sợi trên", color: "#ef4444" },
//   e02: { message: "Đứt sợi dưới", color: "#ef4444" },
//   e03: { message: "Đứt lõi cách điện", color: "#93c5fd" },
//   e04: { message: "Đứt băng nhôm", color: "#f97316" },
//   e05: { message: "Bơm dầu không lên", color: "#a855f7" },
//   e06: { message: "Mức dầu thấp", color: "#a855f7" },
//   e07: { message: "Quá tải bơm dầu", color: "#a855f7" },
//   e08: { message: "Lỗi biến tần", color: "#a855f7" },
//   e09: { message: "Truyền thông biến tần", color: "#a855f7" },
//   e10: { message: "Lỗi trục cuốn", color: "#a855f7" },
//   e11: { message: "Báo động maoci", color: "#a855f7" },
//   e12: { message: "Cửa mở", color: "#a855f7" },
//   e13: { message: "Đang dừng khẩn cấp", color: "#a855f7" },
// };

// const statusTypes = [
//   { value: 0, name: "Máy chạy", color: "#34d399" },
//   { value: 1, name: "Máy dừng", color: "#9ca3af" },
//   { value: 2, name: "Máy tắt", color: "#3b82f6" },
//   { value: 3, name: "Đứt sợi trên", color: "#f87171" },
//   { value: 4, name: "Đứt sợi dưới", color: "#fbbf24" },
//   { value: 5, name: "Đứt lõi cách điện", color: "#60a5fa" },
//   { value: 6, name: "Đứt lõi băng nhôm", color: "#facc15" },
//   { value: 7, name: "Lỗi khác", color: "#a78bfa" },
// ];

// const groupSize = 20;
// const totalMachines = 200;
// const machines = Array.from({ length: totalMachines }, (_, i) => ` ${i + 1}`);
// const machineGroups: string[][] = [];

// for (let i = 0; i < machines.length; i += groupSize) {
//   machineGroups.push(machines.slice(i, i + groupSize));
// }

// export default function Overview() {
//   const [systemData, setSystemData] = useState({
//     totalMachines: 0,
//     runningMachines: 0,
//     stoppedMachines: 0,
//     offMachines: 0,
//     averageEfficiency: NaN,
//     errorDistribution: {} as Record<string, number>,
//     highEfficiencyMachines: NaN,
//     lowEfficiencyMachines: NaN,
//     machinesByError: {} as Record<string, string[]>,
//     totalActualMeters: 0,
//     totalTargetMeters: 0,
//     machineStatuses: [] as {
//       id: string;
//       statusType: number;
//       statusName: string;
//     }[],
//   });
//   const [cycle, setCycle] = useState<number | null>(100);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const mapErrorToStatusType = (errorCode: ErrorCode | null): number => {
//     if (!errorCode) return 8;
//     switch (errorCode.toLowerCase()) {
//       case "e01":
//         return 3;
//       case "e02":
//         return 4;
//       case "e03":
//         return 5;
//       case "e04":
//         return 6;
//       default:
//         return 7;
//     }
//   };

//   const getStatusName = (statusType: number): string => {
//     const status = statusTypes.find((s) => s.value === statusType);
//     return status ? status.name : "Không xác định";
//   };

//   const getErrorCode = (regs: number[]): ErrorCode | null => {
//     if (!regs || regs.length < 7) return null;

//     // Thanh ghi 0: Kiểm tra lỗi E03, E04
//     const reg0 = regs[0];
//     const reg0Binary = reg0.toString(2).padStart(16, "0");
//     const reg0Bits = reg0Binary.slice(-6); // Lấy 6 bit cuối (fedcba)
//     const errorE03 = reg0Bits[4] === "1" ? "e03" : null; // bit b
//     const errorE04 = reg0Bits[3] === "1" ? "e04" : null; // bit c

//     // Thanh ghi 6: Kiểm tra lỗi E01, E02, E05-E13
//     const reg6 = regs[6];
//     const reg6Binary = reg6.toString(2).padStart(16, "0");
//     const reg6Bits = reg6Binary.slice(-11); // Lấy 11 bit cuối (kji hgfe dcba)
//     const errors = [
//       reg6Bits[10] === "1" ? "e01" : null, // bit a
//       reg6Bits[9] === "1" ? "e02" : null, // bit b
//       reg6Bits[8] === "1" ? "e05" : null, // bit c
//       reg6Bits[7] === "1" ? "e06" : null, // bit d
//       reg6Bits[6] === "1" ? "e07" : null, // bit e
//       reg6Bits[5] === "1" ? "e08" : null, // bit f
//       reg6Bits[4] === "1" ? "e09" : null, // bit g
//       reg6Bits[3] === "1" ? "e10" : null, // bit h
//       reg6Bits[2] === "1" ? "e11" : null, // bit i
//       reg6Bits[1] === "1" ? "e12" : null, // bit j
//       reg6Bits[0] === "1" ? "e13" : null, // bit k
//     ].filter((e): e is ErrorCode => e !== null);

//     // Ưu tiên lỗi: E01 > E02 > E03 > E04 > E05 > ... > E13
//     const allErrors = [...errors, errorE03, errorE04].filter(
//       (e): e is ErrorCode => e !== null
//     );
//     if (allErrors.length === 0) return null;
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
//     return allErrors.sort(
//       (a, b) => priorityErrors.indexOf(a) - priorityErrors.indexOf(b)
//     )[0];
//   };

//   useInterval(async () => {
//     setCycle(null);
//     setErrorMessage(null);
//     try {
//       const res = await api_get_main_data();
//       if (!res) {
//         console.log("Lỗi: Không nhận được dữ liệu từ API");
//         setErrorMessage("Không nhận được dữ liệu từ API");
//         setCycle(3000);
//         return;
//       }

//       console.log("Dữ liệu thô từ API:", res);
//       const data = res instanceof Response ? await res.json() : res;
//       console.log("Dữ liệu sau khi parse:", data);
//       console.log("Kiểu dữ liệu của data:", typeof data);

//       // Kiểm tra và xử lý dữ liệu linh hoạt
//       let nodes: any[] = [];
//       if (Array.isArray(data)) {
//         nodes = data;
//       } else if (data && typeof data === "object") {
//         const possibleKeys = ["nodes", "data", "result", "machines"];
//         const foundKey = possibleKeys.find((key) => Array.isArray(data[key]));
//         if (foundKey) {
//           nodes = data[foundKey];
//         } else if (data.error) {
//           console.error("API trả về lỗi:", data.error);
//           setErrorMessage(`Lỗi từ API: ${data.error}`);
//           setCycle(3000);
//           return;
//         } else {
//           console.error("Dữ liệu không chứa mảng node:", data);
//           setErrorMessage("Dữ liệu API không đúng định dạng");
//           setCycle(3000);
//           return;
//         }
//       } else {
//         console.error("Dữ liệu không phải mảng hoặc object:", data);
//         setErrorMessage("Dữ liệu API không hợp lệ");
//         setCycle(3000);
//         return;
//       }

//       // Xử lý dữ liệu từ JSON
//       const machines: MachineData[] = [];
//       let totalDataCount = 0;

//       nodes.forEach((node: any, nodeIndex: number) => {
//         if (node.data_count && typeof node.data_count === "number") {
//           totalDataCount += node.data_count;
//         } else {
//           console.warn(
//             `Node ${nodeIndex} thiếu hoặc data_count không hợp lệ:`,
//             node.data_count
//           );
//         }

//         if (node.data && Array.isArray(node.data)) {
//           node.data.forEach((machine: any, machineIndex: number) => {
//             if (!machine.ip || !machine.regs) {
//               console.warn(
//                 `Máy ${machineIndex} trong node ${nodeIndex} thiếu ip hoặc regs:`,
//                 machine
//               );
//               return;
//             }

//             const ipParts = machine.ip.split(".");
//             const ipLastPart = parseInt(ipParts[3]);
//             if (ipLastPart < 11 || ipLastPart > 210) {
//               console.warn(
//                 `IP không hợp lệ cho máy ${machine.ip}: ${ipLastPart}`
//               );
//               return;
//             }
//             const id = ipLastPart - 10; // 192.168.110.11 -> ID 1, 192.168.110.210 -> ID 200
//             const regs = Array.isArray(machine.regs) ? machine.regs : [];
//             const so_met_dat = regs[3] ? regs[3] / 10 : 0;
//             const so_met_thuc = regs[4] ? regs[4] / 10 : 0;
//             const toc_do_dat = regs[1] ? regs[1] / 10 : 0;
//             const toc_do_thuc = regs[2] ? regs[2] / 10 : 0;
//             const ma_loi = getErrorCode(regs);
//             const fps = typeof machine.fps === "number" ? machine.fps : 0;

//             machines.push({
//               id,
//               status: machine.connection || false,
//               fps,
//               so_met_dat,
//               so_met_thuc,
//               toc_do_dat,
//               toc_do_thuc,
//               hieu_suat: NaN,
//               ma_loi,
//               regs,
//             });

//             // Log debug cho máy con 1
//             // if (id === 1) {
//             //   console.log(`Máy 1 (IP: ${machine.ip}):`, {
//             //     regs,
//             //     isRunning: regs[0]
//             //       ? regs[0].toString(2).padStart(16, "0").slice(-6)[1] === "1"
//             //       : false,
//             //     isStopped: regs[0]
//             //       ? regs[0].toString(2).padStart(16, "0").slice(-6)[0] === "1"
//             //       : false,
//             //     toc_do_thuc,
//             //     ma_loi,
//             //     status: machine.connection,
//             //     fps,
//             //   });
//             // }
//           });
//         } else {
//           console.warn(
//             `Node ${nodeIndex} thiếu hoặc data không phải mảng:`,
//             node.data
//           );
//         }
//       });

//       // Tính toán các số liệu tổng hợp
//       const errorDistribution: Record<string, number> = {};
//       const machinesByError: Record<string, string[]> = {};

//       Object.keys(errorCodes).forEach((key) => {
//         errorDistribution[key] = 0;
//         machinesByError[key] = [];
//       });

//       machines.forEach((machine) => {
//         if (machine?.ma_loi) {
//           const errorKey = machine.ma_loi.toLowerCase();
//           if (errorCodes[errorKey]) {
//             errorDistribution[errorKey]++;
//             machinesByError[errorKey].push(
//               `MÁY ${String(machine.id).padStart(2, "0")}`
//             );
//           }
//         }
//       });

//       const machineStatuses = machines.map((machine) => {
//         const reg0 = machine.regs[0] || 0;
//         const reg0Binary = reg0.toString(2).padStart(16, "0");
//         const reg0Bits = reg0Binary.slice(-6); // Lấy 6 bit cuối (fedcba)
//         const isRunning = reg0Bits[1] === "1"; // bit e: máy chạy
//         const ma_loi = machine.ma_loi;

//         let statusType: number;
//         if (ma_loi === "e01") {
//           statusType = 3; // Đứt sợi trên (ưu tiên 1)
//         } else if (ma_loi === "e02") {
//           statusType = 4; // Đứt sợi dưới (ưu tiên 1)
//         } else if (ma_loi === "e03") {
//           statusType = 5; // Đứt lõi cách điện (ưu tiên 2)
//         } else if (ma_loi === "e04") {
//           statusType = 6; // Đứt băng nhôm (ưu tiên 3)
//         } else if (
//           ma_loi &&
//           [
//             "e05",
//             "e06",
//             "e07",
//             "e08",
//             "e09",
//             "e10",
//             "e11",
//             "e12",
//             "e13",
//           ].includes(ma_loi)
//         ) {
//           statusType = 7; // Lỗi khác (ưu tiên 4)
//         } else if (!machine.status) {
//           statusType = 2; // Máy tắt (connection = false)
//         } else if (machine.status && machine.fps === 0) {
//           statusType = 1; // Máy dừng (connection = true, fps = 0)
//         } else if (
//           machine.status &&
//           machine.fps > 0 &&
//           isRunning &&
//           machine.toc_do_thuc > 0
//         ) {
//           statusType = 0; // Máy chạy
//         } else {
//           statusType = 2; // Máy tắt (mặc định)
//         }

//         const status = {
//           id: `MÁY ${String(machine.id).padStart(2, "0")}`,
//           statusType,
//           statusName: getStatusName(statusType),
//         };

//         // Log trạng thái máy con 1
//         // if (machine.id === 1) {
//         //   console.log(`Trạng thái MÁY 01:`, status);
//         // }

//         return status;
//       });

//       // Điền trạng thái cho các máy còn lại (nếu thiếu)
//       const allMachineStatuses = Array.from(
//         { length: totalMachines },
//         (_, i) => {
//           const machine = machines.find((m) => m.id === i + 1);
//           if (machine) {
//             return (
//               machineStatuses.find(
//                 (s) => s.id === `MÁY ${String(machine.id).padStart(2, "0")}`
//               ) || {
//                 id: `MÁY ${String(i + 1).padStart(2, "0")}`,
//                 statusType: 2, // Máy tắt
//                 statusName: "Máy tắt",
//               }
//             );
//           }
//           return {
//             id: `MÁY ${String(i + 1).padStart(2, "0")}`,
//             statusType: 2, // Máy tắt
//             statusName: "Máy tắt",
//           };
//         }
//       );

//       // Tính toán các số liệu tổng hợp
//       const totalMachinesCount = totalDataCount;
//       const runningMachines = machines.filter((m) => {
//         const reg0 = m.regs[0] || 0;
//         const reg0Binary = reg0.toString(2).padStart(16, "0");
//         const reg0Bits = reg0Binary.slice(-6);
//         return (
//           m.status &&
//           m.fps > 0 &&
//           reg0Bits[1] === "1" &&
//           m.toc_do_thuc > 0 &&
//           !m.ma_loi
//         );
//       }).length;
//       const stoppedMachines = machines.filter(
//         (m) => m.status && m.fps === 0 && !m.ma_loi
//       ).length;
//       const offMachines = machines.filter((m) => !m.status && !m.ma_loi).length;
//       const totalActualMeters = machines.reduce(
//         (sum, m) => sum + m.so_met_thuc,
//         0
//       );
//       const totalTargetMeters = machines.reduce(
//         (sum, m) => sum + m.so_met_dat,
//         0
//       );

//       setSystemData({
//         totalMachines: totalMachinesCount,
//         runningMachines,
//         stoppedMachines,
//         offMachines,
//         averageEfficiency: NaN,
//         errorDistribution,
//         highEfficiencyMachines: NaN,
//         lowEfficiencyMachines: NaN,
//         machinesByError,
//         totalActualMeters,
//         totalTargetMeters,
//         machineStatuses: allMachineStatuses,
//       });
//     } catch (error) {
//       console.error("Lỗi khi lấy dữ liệu:", error);
//       setErrorMessage("Lỗi khi lấy dữ liệu từ API");
//       setCycle(3000);
//     } finally {
//       setCycle(1000);
//     }
//   }, cycle);

//   const formatNumber = (num: number) =>
//     isNaN(num) ? "NaN" : num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//   const heatmapOption = useMemo(() => {
//     const reversedMachineGroups = [...machineGroups].reverse();
//     const groupLabels = reversedMachineGroups.map(
//       (_, index) => `Nhóm ${machineGroups.length - index}`
//     );

//     const generateMachineData = () => {
//       const data = [];
//       for (
//         let groupIndex = 0;
//         groupIndex < reversedMachineGroups.length;
//         groupIndex++
//       ) {
//         for (let machineIndex = 0; machineIndex < groupSize; machineIndex++) {
//           const originalGroupIndex = machineGroups.length - 1 - groupIndex;
//           const overallIndex = originalGroupIndex * groupSize + machineIndex;
//           const statusValue =
//             systemData.machineStatuses[overallIndex]?.statusType ?? 2;
//           data.push([machineIndex, groupIndex, statusValue]);
//         }
//       }
//       return data;
//     };

//     return {
//       animation: false,
//       title: {
//         left: "center",
//         textStyle: { color: "#e5e7eb", fontSize: 20 },
//       },
//       tooltip: {
//         position: "top",
//         formatter: (params: any) => {
//           const groupIndex = params.data[1];
//           const machineIndex = params.data[0];
//           const machineId = reversedMachineGroups[groupIndex][machineIndex];
//           const status = statusTypes.find((s) => s.value === params.data[2]);
//           return `Máy ${machineId}: ${status?.name || "Không xác định"}`;
//         },
//       },
//       grid: {
//         height: "90%",
//         width: "100%",
//         top: "0%",
//         left: "0%",
//         right: "0%",
//       },
//       xAxis: {
//         type: "category",
//         data: Array.from({ length: groupSize }, (_, i) => i + 1),
//         splitArea: { show: false },
//         axisLabel: { show: false },
//       },
//       yAxis: {
//         type: "category",
//         data: groupLabels,
//         splitArea: { show: true },
//         axisLabel: { show: false },
//       },
//       visualMap: {
//         type: "piecewise",
//         min: 0,
//         max: 7,
//         calculable: false,
//         orient: "horizontal",
//         left: "center",
//         top: "95%",
//         pieces: [
//           { min: 0, max: 0, label: "Máy chạy", color: "#34d399" },
//           { min: 1, max: 1, label: "Máy dừng", color: "#3b82f6" },
//           { min: 2, max: 2, label: "Máy tắt", color: "#9ca3af" },
//           { min: 3, max: 3, label: "Đứt sợi trên", color: "#f87171" },
//           { min: 4, max: 4, label: "Đứt sợi dưới", color: "#fbbf24" },
//           { min: 5, max: 5, label: "Đứt lõi cách điện", color: "#60a5fa" },
//           { min: 6, max: 6, label: "Đứt lõi băng nhôm", color: "#facc15" },
//           { min: 7, max: 7, label: "Lỗi khác", color: "#a78bfa" },
//         ],
//         textStyle: {
//           color: "#e5e7eb",
//           fontSize: 16,
//           fontWeight: "bold",
//           fontFamily: "sans-serif",
//         },
//         itemWidth: 30,
//         itemHeight: 20,
//         itemGap: 28,
//       },
//       series: [
//         {
//           name: "Trạng thái máy",
//           type: "heatmap",
//           data: generateMachineData(),
//           label: {
//             show: true,
//             formatter: (params: any) => {
//               const groupIndex = params.data[1];
//               const machineIndex = params.data[0];
//               return reversedMachineGroups[groupIndex][machineIndex];
//             },
//             color: "#fff",
//             fontSize: 15,
//           },
//           itemStyle: { borderColor: "#1f2937", borderWidth: 1 },
//           emphasis: {
//             itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.5)" },
//           },
//         },
//       ],
//     };
//   }, [systemData.machineStatuses]);

//   return (
//     <main className="min-h-screen bg-gray-900 text-white font-sans w-full">
//       <div className="h-full w-full p-6">
//         {errorMessage ? (
//           <div className="bg-red-900/50 p-4 rounded-lg mb-6">
//             <p className="text-red-400">{errorMessage}</p>
//           </div>
//         ) : null}
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-indigo-500 text-transparent bg-clip-text">
//             DASHBOARD
//           </h1>
//           <Link
//             href="/shikoku/dashboard_chi_tiet"
//             className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-5 py-2.5 rounded-lg flex items-center text-sm font-medium transition-all duration-300"
//           >
//             <span>Xem chi tiết các máy</span>
//             <svg
//               className="w-5 h-5 ml-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M9 5l7 7-7 7"
//               />
//             </svg>
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//           <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-teal-500">
//             <div className="flex items-center justify-between mb-2 ">
//               <h2 className="text-lg font-semibold text-gray-200">
//                 Tổng số máy
//               </h2>
//               <div className="bg-teal-900/30 p-1 rounded-lg">
//                 <svg
//                   className="w-8 h-8 text-teal-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
//                   />
//                 </svg>
//               </div>
//             </div>
//             <div className="flex items-center mb-3">
//               <span className="text-4xl font-bold text-teal-400">
//                 {systemData.totalMachines}
//               </span>
//             </div>
//             <div className="grid grid-cols-3 gap-2">
//               <div className="bg-gray-700/40 p-2 rounded-lg">
//                 <div className="text-xs font-bold text-gray-400">Đang chạy</div>
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
//                   <div className="text-base font-semibold text-green-400">
//                     {systemData.runningMachines}
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-700/40 p-2 rounded-lg">
//                 <div className="text-xs text-gray-400">Đang dừng</div>
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
//                   <div className="text-base font-semibold text-blue-400">
//                     {systemData.stoppedMachines}
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-700/40 p-2 rounded-lg">
//                 <div className="text-xs text-gray-400">Đang tắt</div>
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 rounded-full bg-gray-500 mr-1"></div>
//                   <div className="text-base font-semibold text-gray-500">
//                     {systemData.offMachines}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-teal-500 */}
//           <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-teal-500">
//             <div className="flex items-center justify-between mb-2 ">
//               <h2 className="text-lg font-semibold text-gray-200">
//                 Hiệu suất trung bình
//               </h2>
//               <div className="bg-green-900/30 p-1 rounded-lg">
//                 <svg
//                   className="w-8 h-8 text-green-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
//                   />
//                 </svg>
//               </div>
//             </div>
//             <div className="flex items-center mb-3">
//               <span className="text-4xl font-bold text-green-400">
//                 {isNaN(systemData.averageEfficiency)
//                   ? "NaN"
//                   : `${Math.round(systemData.averageEfficiency)}%`}
//               </span>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <div className="bg-gray-700/40 p-2 rounded-lg">
//                 <div className="text-xs text-gray-400">
//                   Hiệu suất cao (≥85%)
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
//                   <div className="text-base font-semibold text-green-400">
//                     {isNaN(systemData.highEfficiencyMachines)
//                       ? "NaN"
//                       : systemData.highEfficiencyMachines}
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-700/40 p-2 rounded-lg">
//                 <div className="text-xs text-gray-400">
//                   Hiệu suất thấp (≤50%)
//                 </div>
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
//                   <div className="text-base font-semibold text-red-400">
//                     {isNaN(systemData.lowEfficiencyMachines)
//                       ? "NaN"
//                       : systemData.lowEfficiencyMachines}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-teal-500">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold text-gray-200">
//                 Tổng số lỗi hiện tại
//               </h2>
//               <div className="bg-red-900/30 p-1 rounded-lg">
//                 <svg
//                   className="w-8 h-8 text-red-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
//                   />
//                 </svg>
//               </div>
//             </div>
//             <div className="flex items-center mb-3">
//               <span className="text-4xl font-bold text-red-400">
//                 {Object.values(systemData.errorDistribution).reduce(
//                   (a, b) => a + b,
//                   0
//                 )}
//               </span>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <div className="bg-gray-700/40 p-2 rounded-lg">
//                 <div className="text-xs text-gray-400">Lỗi hiển thị</div>
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
//                   <div className="text-base font-semibold text-red-400">
//                     {(systemData.errorDistribution["e01"] || 0) +
//                       (systemData.errorDistribution["e02"] || 0) +
//                       (systemData.errorDistribution["e03"] || 0) +
//                       (systemData.errorDistribution["e04"] || 0)}
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-700/40 p-2 rounded-lg">
//                 <div className="text-xs text-gray-400">Lỗi khác</div>
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
//                   <div className="text-base font-semibold text-orange-400">
//                     {Object.keys(systemData.errorDistribution)
//                       .filter(
//                         (key) => !["e01", "e02", "e03", "e04"].includes(key)
//                       )
//                       .reduce(
//                         (sum, key) => sum + systemData.errorDistribution[key],
//                         0
//                       )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-teal-500">
//             <div className="flex items-center justify-between mb-2">
//               <h2 className="text-lg font-semibold text-gray-200">
//                 Tiến độ sản xuất
//               </h2>
//               <div className="bg-purple-900/30 p-1 rounded-lg">
//                 <svg
//                   className="w-8 h-8 text-purple-500"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
//                   />
//                 </svg>
//               </div>
//             </div>
//             <div className="flex items-center mb-3">
//               <span className="text-4xl font-bold text-purple-400">
//                 {systemData.totalTargetMeters > 0
//                   ? Math.round(
//                       (systemData.totalActualMeters /
//                         systemData.totalTargetMeters) *
//                         100
//                     )
//                   : 0}
//                 %
//               </span>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <div className="bg-gray-700/40 p-2 rounded-lg">
//                 <div className="text-xs text-gray-400">Tổng mét thực tế</div>
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
//                   <div className="text-base font-semibold text-blue-400">
//                     {formatNumber(systemData.totalActualMeters)}
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-700/40 p-2 rounded-lg">
//                 <div className="text-xs text-gray-400">Tổng mét mục tiêu</div>
//                 <div className="flex items-center">
//                   <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
//                   <div className="text-base font-semibold text-yellow-400">
//                     {formatNumber(systemData.totalTargetMeters)}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 w-full">
//           <h2 className="text-2xl font-bold text-gray-200 text-center mb-6">
//             BIỂU ĐỒ NHIỆT TRẠNG THÁI MÁY
//           </h2>
//           <div className="relative h-[628px] w-full">
//             <ReactECharts
//               option={heatmapOption}
//               style={{ height: "104%", width: "100%" }}
//               notMerge={true}
//               lazyUpdate={true}
//             />
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

//!----------------------------------------------------------------------
"use client";
import React, { useState, useMemo } from "react";
import { useInterval } from "usehooks-ts";
import Link from "next/link";
import ReactECharts from "echarts-for-react";
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
  status: boolean;
  fps: number;
  so_met_dat: number;
  so_met_thuc: number;
  toc_do_dat: number;
  toc_do_thuc: number;
  hieu_suat: number;
  ma_loi: ErrorCode | null;
  regs: number[];
  history: { timestamp: string; status: boolean; ma_loi: ErrorCode | null }[];
};

const errorCodes: Record<string, { message: string; color: string }> = {
  e01: { message: "Đứt sợi trên", color: "#ef4444" },
  e02: { message: "Đứt sợi dưới", color: "#ef4444" },
  e03: { message: "Đứt lõi cách điện", color: "#93c5fd" },
  e04: { message: "Đứt băng nhôm", color: "#f97316" },
  e05: { message: "Bơm dầu không lên", color: "#a855f7" },
  e06: { message: "Mức dầu thấp", color: "#a855f7" },
  e07: { message: "Quá tải bơm dầu", color: "#a855f7" },
  e08: { message: "Lỗi biến tần", color: "#a855f7" },
  e09: { message: "Truyền thông biến tần", color: "#a855f7" },
  e10: { message: "Lỗi trục cuốn", color: "#a855f7" },
  e11: { message: "Báo động maoci", color: "#a855f7" },
  e12: { message: "Cửa mở", color: "#a855f7" },
  e13: { message: "Đang dừng khẩn cấp", color: "#a855f7" },
};

const statusTypes = [
  { value: 0, name: "Máy chạy", color: "#34d399" },
  { value: 1, name: "Máy dừng", color: "#9ca3af" },
  { value: 2, name: "Máy tắt", color: "#3b82f6" },
  { value: 3, name: "Đứt sợi trên", color: "#f87171" },
  { value: 4, name: "Đứt sợi dưới", color: "#fbbf24" },
  { value: 5, name: "Đứt lõi cách điện", color: "#60a5fa" },
  { value: 6, name: "Đứt lõi băng nhôm", color: "#facc15" },
  { value: 7, name: "Lỗi khác", color: "#a78bfa" },
];

const groupSize = 20;
const totalMachines = 200;
const machines = Array.from({ length: totalMachines }, (_, i) => ` ${i + 1}`);
const machineGroups: string[][] = [];

for (let i = 0; i < machines.length; i += groupSize) {
  machineGroups.push(machines.slice(i, i + groupSize));
}

export default function Overview() {
  const [systemData, setSystemData] = useState({
    totalMachines: 0,
    runningMachines: 0,
    stoppedMachines: 0,
    offMachines: 0,
    averageEfficiency: NaN,
    errorDistribution: {} as Record<string, number>,
    highEfficiencyMachines: NaN,
    lowEfficiencyMachines: NaN,
    machinesByError: {} as Record<string, string[]>,
    totalActualMeters: 0,
    totalTargetMeters: 0,
    machineStatuses: [] as {
      id: string;
      statusType: number;
      statusName: string;
    }[],
  });
  const [cycle, setCycle] = useState<number | null>(100);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Lưu trữ history cục bộ cho các máy
  const [machineHistories, setMachineHistories] = useState<
    Record<number, MachineData["history"]>
  >({});

  const mapErrorToStatusType = (errorCode: ErrorCode | null): number => {
    if (!errorCode) return 8;
    switch (errorCode.toLowerCase()) {
      case "e01":
        return 3;
      case "e02":
        return 4;
      case "e03":
        return 5;
      case "e04":
        return 6;
      default:
        return 7;
    }
  };

  const getStatusName = (statusType: number): string => {
    const status = statusTypes.find((s) => s.value === statusType);
    return status ? status.name : "Không xác định";
  };

  const getErrorCode = (regs: number[]): ErrorCode | null => {
    if (!regs || regs.length < 7) return null;

    const reg0 = regs[0];
    const reg0Binary = reg0.toString(2).padStart(16, "0");
    const reg0Bits = reg0Binary.slice(-6);
    const errorE03 = reg0Bits[4] === "1" ? "e03" : null;
    const errorE04 = reg0Bits[3] === "1" ? "e04" : null;

    const reg6 = regs[6];
    const reg6Binary = reg6.toString(2).padStart(16, "0");
    const reg6Bits = reg6Binary.slice(-11);
    const errors = [
      reg6Bits[10] === "1" ? "e01" : null,
      reg6Bits[9] === "1" ? "e02" : null,
      reg6Bits[8] === "1" ? "e05" : null,
      reg6Bits[7] === "1" ? "e06" : null,
      reg6Bits[6] === "1" ? "e07" : null,
      reg6Bits[5] === "1" ? "e08" : null,
      reg6Bits[4] === "1" ? "e09" : null,
      reg6Bits[3] === "1" ? "e10" : null,
      reg6Bits[2] === "1" ? "e11" : null,
      reg6Bits[1] === "1" ? "e12" : null,
      reg6Bits[0] === "1" ? "e13" : null,
    ].filter((e): e is ErrorCode => e !== null);

    const allErrors = [...errors, errorE03, errorE04].filter(
      (e): e is ErrorCode => e !== null
    );
    if (allErrors.length === 0) return null;
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
    return allErrors.sort(
      (a, b) => priorityErrors.indexOf(a) - priorityErrors.indexOf(b)
    )[0];
  };

  useInterval(async () => {
    setCycle(null);
    setErrorMessage(null);
    try {
      const res = await api_get_main_data();
      if (!res) {
        console.log("Lỗi: Không nhận được dữ liệu từ API");
        setErrorMessage("Không nhận được dữ liệu từ API");
        setCycle(3000);
        return;
      }

      console.log("Dữ liệu thô từ API:", res);
      const data = res instanceof Response ? await res.json() : res;
      console.log("Dữ liệu sau khi parse:", data);
      console.log("Kiểu dữ liệu của data:", typeof data);

      let nodes: any[] = [];
      if (Array.isArray(data)) {
        nodes = data;
      } else if (data && typeof data === "object") {
        const possibleKeys = ["nodes", "data", "result", "machines"];
        const foundKey = possibleKeys.find((key) => Array.isArray(data[key]));
        if (foundKey) {
          nodes = data[foundKey];
        } else if (data.error) {
          console.error("API trả về lỗi:", data.error);
          setErrorMessage(`Lỗi từ API: ${data.error}`);
          setCycle(3000);
          return;
        } else {
          console.error("Dữ liệu không chứa mảng node:", data);
          setErrorMessage("Dữ liệu API không đúng định dạng");
          setCycle(3000);
          return;
        }
      } else {
        console.error("Dữ liệu không phải mảng hoặc object:", data);
        setErrorMessage("Dữ liệu API không hợp lệ");
        setCycle(3000);
        return;
      }

      const machines: MachineData[] = [];
      let totalDataCount = 0;
      const now = new Date();
      const currentTime = now.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const maxHistoryRecords = 100;

      // Thời điểm đặt: 6:00 sáng hôm nay (hoặc hôm qua nếu trước 6:00)
      const baseDate = new Date(now);
      baseDate.setHours(6, 0, 0, 0);
      if (now.getHours() < 6) {
        baseDate.setDate(baseDate.getDate() - 1);
      }
      const startTime = baseDate.getTime();

      // Sao chép machineHistories hiện tại để cập nhật
      const updatedHistories = { ...machineHistories };

      nodes.forEach((node: any, nodeIndex: number) => {
        if (node.data_count && typeof node.data_count === "number") {
          totalDataCount += node.data_count;
        } else {
          console.warn(
            `Node ${nodeIndex} thiếu hoặc data_count không hợp lệ:`,
            node.data_count
          );
        }

        if (node.data && Array.isArray(node.data)) {
          node.data.forEach((machine: any, machineIndex: number) => {
            if (!machine.ip || !machine.regs) {
              console.warn(
                `Máy ${machineIndex} trong node ${nodeIndex} thiếu ip hoặc regs:`,
                machine
              );
              return;
            }

            const ipParts = machine.ip.split(".");
            const ipLastPart = parseInt(ipParts[3]);
            if (ipLastPart < 11 || ipLastPart > 210) {
              console.warn(
                `IP không hợp lệ cho máy ${machine.ip}: ${ipLastPart}`
              );
              return;
            }
            const id = ipLastPart - 10;
            const regs = Array.isArray(machine.regs) ? machine.regs : [];
            const so_met_dat = regs[3] ? regs[3] / 10 : 0;
            const so_met_thuc = regs[4] ? regs[4] / 10 : 0;
            const toc_do_dat = regs[1] ? regs[1] / 10 : 0;
            const toc_do_thuc = regs[2] ? regs[2] / 10 : 0;
            const ma_loi = getErrorCode(regs);
            const fps = typeof machine.fps === "number" ? machine.fps : 0;
            const timestamp =
              machine.last_time_ok ||
              node.last_update ||
              new Date().toISOString();
            const reg0 = regs[0] || 0;
            const reg0Binary = reg0.toString(2).padStart(16, "0");
            const reg0Bits = reg0Binary.slice(-6);
            const isRunning = reg0Bits[1] === "1";

            let status: boolean;
            if (ma_loi) {
              status = false;
            } else if (!machine.connection) {
              status = false;
            } else if (machine.connection && fps === 0) {
              status = false;
            } else if (
              machine.connection &&
              fps > 0 &&
              isRunning &&
              toc_do_thuc > 0
            ) {
              status = true;
            } else {
              status = false;
            }

            console.log(`Máy ${id} (IP: ${machine.ip}):`, {
              status,
              ma_loi,
              connection: machine.connection,
              fps,
              bitRunning: reg0Bits[1],
              toc_do_thuc,
              timestamp,
            });

            // Cập nhật history
            let history = updatedHistories[id] || [];
            const lastRecord = history[history.length - 1];
            if (
              !lastRecord ||
              lastRecord.status !== status ||
              lastRecord.ma_loi !== ma_loi
            ) {
              history.push({
                timestamp,
                status,
                ma_loi,
              });
              console.log(`Cập nhật history máy ${id}:`, {
                timestamp,
                status,
                ma_loi,
              });
            } else {
              console.log(
                `Không thay đổi trạng thái máy ${id}, bỏ qua cập nhật history`
              );
            }

            // Lọc history trong 24 giờ và giới hạn số bản ghi
            history = history
              .filter(
                (h) =>
                  new Date(currentTime).getTime() -
                    new Date(h.timestamp).getTime() <=
                  oneDayMs
              )
              .slice(-maxHistoryRecords);
            updatedHistories[id] = history;

            // Tính hiệu suất: h = (t/T) * 100
            const T_ms = Math.min(currentTime - startTime, oneDayMs);
            const T_hours = T_ms / (1000 * 60 * 60);
            let t_hours = 0;

            if (history.length > 0) {
              const sortedHistory = [...history]
                .sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )
                .filter((h) => new Date(h.timestamp).getTime() >= startTime);

              console.log(
                `Sorted history máy ${id} từ 6:00 sáng:`,
                sortedHistory
              );

              let lastTime = startTime;
              sortedHistory.forEach((record, index) => {
                const recordTime = new Date(record.timestamp).getTime();
                const start = Math.max(recordTime, startTime);
                const end =
                  index < sortedHistory.length - 1
                    ? Math.min(
                        new Date(sortedHistory[index + 1].timestamp).getTime(),
                        currentTime
                      )
                    : currentTime;
                const duration_ms = end - start;

                if (duration_ms > 0) {
                  if (record.status && !record.ma_loi) {
                    t_hours += duration_ms / (1000 * 60 * 60);
                  }
                  console.log(
                    `Máy ${id} - Khoảng thời gian từ ${new Date(
                      start
                    ).toISOString()} đến ${new Date(end).toISOString()}:`,
                    {
                      status: record.status
                        ? "running"
                        : record.ma_loi || "stopped",
                      ma_loi: record.ma_loi,
                      duration_hours: (duration_ms / (1000 * 60 * 60)).toFixed(
                        2
                      ),
                      contributes_to_t: record.status && !record.ma_loi,
                    }
                  );
                }
                lastTime = end;
              });

              // Kiểm tra khoảng thời gian từ 6:00 sáng đến bản ghi đầu tiên
              const firstRecordTime = sortedHistory.length
                ? new Date(sortedHistory[0].timestamp).getTime()
                : currentTime;
              if (firstRecordTime > startTime) {
                const initialDuration_ms = firstRecordTime - startTime;
                console.log(
                  `Máy ${id} - Khoảng thời gian đầu từ 6:00 sáng đến ${new Date(
                    firstRecordTime
                  ).toISOString()}:`,
                  {
                    status: "off",
                    duration_hours: (
                      initialDuration_ms /
                      (1000 * 60 * 60)
                    ).toFixed(2),
                    contributes_to_t: false,
                  }
                );
              }
            } else {
              console.log(
                `Máy ${id} - Không có history, giả định off từ 6:00 sáng`
              );
            }

            const hieu_suat = T_hours > 0 ? (t_hours / T_hours) * 100 : 0;

            console.log(`Hiệu suất máy ${id}:`, {
              T_hours: T_hours.toFixed(2),
              t_hours: t_hours.toFixed(2),
              hieu_suat: hieu_suat.toFixed(1) + "%",
            });

            machines.push({
              id,
              status: machine.connection || false,
              fps,
              so_met_dat,
              so_met_thuc,
              toc_do_dat,
              toc_do_thuc,
              hieu_suat,
              ma_loi,
              regs,
              history,
            });
          });
        } else {
          console.warn(
            `Node ${nodeIndex} thiếu hoặc data không phải mảng:`,
            node.data
          );
        }
      });

      // Cập nhật machineHistories
      setMachineHistories(updatedHistories);

      // Tính toán các số liệu tổng hợp
      const errorDistribution: Record<string, number> = {};
      const machinesByError: Record<string, string[]> = {};

      Object.keys(errorCodes).forEach((key) => {
        errorDistribution[key] = 0;
        machinesByError[key] = [];
      });

      machines.forEach((machine) => {
        if (machine?.ma_loi) {
          const errorKey = machine.ma_loi.toLowerCase();
          if (errorCodes[errorKey]) {
            errorDistribution[errorKey]++;
            machinesByError[errorKey].push(
              `MÁY ${String(machine.id).padStart(2, "0")}`
            );
          }
        }
      });

      const machineStatuses = machines.map((machine) => {
        const reg0 = machine.regs[0] || 0;
        const reg0Binary = reg0.toString(2).padStart(16, "0");
        const reg0Bits = reg0Binary.slice(-6);
        const isRunning = reg0Bits[1] === "1";
        const ma_loi = machine.ma_loi;

        let statusType: number;
        if (ma_loi === "e01") {
          statusType = 3;
        } else if (ma_loi === "e02") {
          statusType = 4;
        } else if (ma_loi === "e03") {
          statusType = 5;
        } else if (ma_loi === "e04") {
          statusType = 6;
        } else if (
          ma_loi &&
          [
            "e05",
            "e06",
            "e07",
            "e08",
            "e09",
            "e10",
            "e11",
            "e12",
            "e13",
          ].includes(ma_loi)
        ) {
          statusType = 7;
        } else if (!machine.status) {
          statusType = 2;
        } else if (machine.status && machine.fps === 0) {
          statusType = 1;
        } else if (
          machine.status &&
          machine.fps > 0 &&
          isRunning &&
          machine.toc_do_thuc > 0
        ) {
          statusType = 0;
        } else {
          statusType = 2;
        }

        const status = {
          id: `MÁY ${String(machine.id).padStart(2, "0")}`,
          statusType,
          statusName: getStatusName(statusType),
        };

        if (machine.id === 1) {
          console.log(`Trạng thái MÁY 01:`, status);
        }

        return status;
      });

      const allMachineStatuses = Array.from(
        { length: totalMachines },
        (_, i) => {
          const machine = machines.find((m) => m.id === i + 1);
          if (machine) {
            return (
              machineStatuses.find(
                (s) => s.id === `MÁY ${String(machine.id).padStart(2, "0")}`
              ) || {
                id: `MÁY ${String(i + 1).padStart(2, "0")}`,
                statusType: 2,
                statusName: "Máy tắt",
              }
            );
          }
          return {
            id: `MÁY ${String(i + 1).padStart(2, "0")}`,
            statusType: 2,
            statusName: "Máy tắt",
          };
        }
      );

      // Tính toán hiệu suất trung bình, cao, thấp
      const validEfficiencies = machines
        .map((m) => m.hieu_suat)
        .filter((e) => !isNaN(e));
      const averageEfficiency =
        validEfficiencies.length > 0
          ? validEfficiencies.reduce((sum, e) => sum + e, 0) /
            validEfficiencies.length
          : 0;
      const highEfficiencyMachines = machines.filter(
        (m) => m.hieu_suat >= 85
      ).length;
      const lowEfficiencyMachines = machines.filter(
        (m) => m.hieu_suat <= 50
      ).length;

      console.log("Số liệu hiệu suất:", {
        averageEfficiency: averageEfficiency.toFixed(1) + "%",
        highEfficiencyMachines,
        lowEfficiencyMachines,
        validMachineCount: validEfficiencies.length,
      });

      const totalMachinesCount = totalDataCount;
      const runningMachines = machines.filter((m) => {
        const reg0 = m.regs[0] || 0;
        const reg0Binary = reg0.toString(2).padStart(16, "0");
        const reg0Bits = reg0Binary.slice(-6);
        return (
          m.status &&
          m.fps > 0 &&
          reg0Bits[1] === "1" &&
          m.toc_do_thuc > 0 &&
          !m.ma_loi
        );
      }).length;
      const stoppedMachines = machines.filter(
        (m) => m.status && m.fps === 0 && !m.ma_loi
      ).length;
      const offMachines = machines.filter((m) => !m.status && !m.ma_loi).length;
      const totalActualMeters = machines.reduce(
        (sum, m) => sum + m.so_met_thuc,
        0
      );
      const totalTargetMeters = machines.reduce(
        (sum, m) => sum + m.so_met_dat,
        0
      );

      setSystemData({
        totalMachines: totalMachinesCount,
        runningMachines,
        stoppedMachines,
        offMachines,
        averageEfficiency,
        errorDistribution,
        highEfficiencyMachines,
        lowEfficiencyMachines,
        machinesByError,
        totalActualMeters,
        totalTargetMeters,
        machineStatuses: allMachineStatuses,
      });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      setErrorMessage("Lỗi khi lấy dữ liệu từ API");
      setCycle(3000);
    } finally {
      setCycle(1000);
    }
  }, cycle);

  const formatNumber = (num: number) =>
    isNaN(num) ? "NaN" : num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const heatmapOption = useMemo(() => {
    const reversedMachineGroups = [...machineGroups].reverse();
    const groupLabels = reversedMachineGroups.map(
      (_, index) => `Nhóm ${machineGroups.length - index}`
    );

    const generateMachineData = () => {
      const data = [];
      for (
        let groupIndex = 0;
        groupIndex < reversedMachineGroups.length;
        groupIndex++
      ) {
        for (let machineIndex = 0; machineIndex < groupSize; machineIndex++) {
          const originalGroupIndex = machineGroups.length - 1 - groupIndex;
          const overallIndex = originalGroupIndex * groupSize + machineIndex;
          const statusValue =
            systemData.machineStatuses[overallIndex]?.statusType ?? 2;
          data.push([machineIndex, groupIndex, statusValue]);
        }
      }
      return data;
    };

    return {
      animation: false,
      title: {
        left: "center",
        textStyle: { color: "#e5e7eb", fontSize: 20 },
      },
      tooltip: {
        position: "top",
        formatter: (params: any) => {
          const groupIndex = params.data[1];
          const machineIndex = params.data[0];
          const machineId = reversedMachineGroups[groupIndex][machineIndex];
          const status = statusTypes.find((s) => s.value === params.data[2]);
          return `Máy ${machineId}: ${status?.name || "Không xác định"}`;
        },
      },
      grid: {
        height: "90%",
        width: "100%",
        top: "0%",
        left: "0%",
        right: "0%",
      },
      xAxis: {
        type: "category",
        data: Array.from({ length: groupSize }, (_, i) => i + 1),
        splitArea: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: "category",
        data: groupLabels,
        splitArea: { show: true },
        axisLabel: { show: false },
      },
      visualMap: {
        type: "piecewise",
        min: 0,
        max: 7,
        calculable: false,
        orient: "horizontal",
        left: "center",
        top: "95%",
        pieces: [
          { min: 0, max: 0, label: "Máy chạy", color: "#34d399" },
          { min: 1, max: 1, label: "Máy dừng", color: "#3b82f6" },
          { min: 2, max: 2, label: "Máy tắt", color: "#9ca3af" },
          { min: 3, max: 3, label: "Đứt sợi trên", color: "#f87171" },
          { min: 4, max: 4, label: "Đứt sợi dưới", color: "#fbbf24" },
          { min: 5, max: 5, label: "Đứt lõi cách điện", color: "#60a5fa" },
          { min: 6, max: 6, label: "Đứt lõi băng nhôm", color: "#facc15" },
          { min: 7, max: 7, label: "Lỗi khác", color: "#a78bfa" },
        ],
        textStyle: {
          color: "#e5e7eb",
          fontSize: 18,
          fontWeight: "bold",
          fontFamily: "sans-serif",
        },
        itemWidth: 30,
        itemHeight: 20,
        itemGap: 28,
      },
      series: [
        {
          name: "Trạng thái máy",
          type: "heatmap",
          data: generateMachineData(),
          label: {
            show: true,
            formatter: (params: any) => {
              const groupIndex = params.data[1];
              const machineIndex = params.data[0];
              return reversedMachineGroups[groupIndex][machineIndex];
            },
            color: "#fff",
            fontSize: 15,
          },
          itemStyle: { borderColor: "#1f2937", borderWidth: 1 },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.5)" },
          },
        },
      ],
    };
  }, [systemData.machineStatuses]);

  return (
    <main className="min-h-screen bg-gray-900 text-white font-sans w-full">
      <div className="h-full w-full p-6">
        {errorMessage ? (
          <div className="bg-red-900/50 p-4 rounded-lg mb-6">
            <p className="text-red-400">{errorMessage}</p>
          </div>
        ) : null}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-indigo-500 text-transparent bg-clip-text">
            DASHBOARD
          </h1>
          <Link
            href="/shikoku/dashboard_chi_tiet"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-5 py-2.5 rounded-lg flex items-center text-sm font-medium transition-all duration-300"
          >
            <span>Xem chi tiết các máy</span>
            <svg
              className="w-5 h-5 ml-2"
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
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-teal-500">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-200">
                Tổng số máy
              </h2>
              <div className="bg-teal-900/30 p-1 rounded-lg">
                <svg
                  className="w-8 h-8 text-teal-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center mb-3">
              <span className="text-4xl font-bold text-teal-400">
                {systemData.totalMachines}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs font-bold text-gray-400">Đang chạy</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <div className="text-base font-semibold text-green-400">
                    {systemData.runningMachines}
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs text-gray-400">Đang dừng</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                  <div className="text-base font-semibold text-blue-400">
                    {systemData.stoppedMachines}
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs text-gray-400">Đang tắt</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-gray-500 mr-1"></div>
                  <div className="text-base font-semibold text-gray-500">
                    {systemData.offMachines}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-teal-500">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-200">
                Hiệu suất trung bình
              </h2>
              <div className="bg-green-900/30 p-1 rounded-lg">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center mb-3">
              <span className="text-4xl font-bold text-green-400">
                {isNaN(systemData.averageEfficiency)
                  ? "0"
                  : `${Math.round(systemData.averageEfficiency)}%`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs text-gray-400">
                  Hiệu suất cao (≥85%)
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                  <div className="text-base font-semibold text-green-400">
                    {systemData.highEfficiencyMachines}
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs text-gray-400">
                  Hiệu suất thấp (≤50%)
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                  <div className="text-base font-semibold text-red-400">
                    {systemData.lowEfficiencyMachines}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-teal-500">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-200">
                Tổng số lỗi hiện tại
              </h2>
              <div className="bg-red-900/30 p-1 rounded-lg">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center mb-3">
              <span className="text-4xl font-bold text-red-400">
                {Object.values(systemData.errorDistribution).reduce(
                  (a, b) => a + b,
                  0
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs text-gray-400">Lỗi hiển thị</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                  <div className="text-base font-semibold text-red-400">
                    {(systemData.errorDistribution["e01"] || 0) +
                      (systemData.errorDistribution["e02"] || 0) +
                      (systemData.errorDistribution["e03"] || 0) +
                      (systemData.errorDistribution["e04"] || 0)}
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs text-gray-400">Lỗi khác</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-1"></div>
                  <div className="text-base font-semibold text-orange-400">
                    {Object.keys(systemData.errorDistribution)
                      .filter(
                        (key) => !["e01", "e02", "e03", "e04"].includes(key)
                      )
                      .reduce(
                        (sum, key) => sum + systemData.errorDistribution[key],
                        0
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-teal-500">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-200">
                Tiến độ sản xuất
              </h2>
              <div className="bg-purple-900/30 p-1 rounded-lg">
                <svg
                  className="w-8 h-8 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center mb-3">
              <span className="text-4xl font-bold text-purple-400">
                {systemData.totalTargetMeters > 0
                  ? Math.round(
                      (systemData.totalActualMeters /
                        systemData.totalTargetMeters) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs text-gray-400">Tổng mét thực tế</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                  <div className="text-base font-semibold text-blue-400">
                    {formatNumber(systemData.totalActualMeters)}
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs text-gray-400">Tổng mét mục tiêu</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
                  <div className="text-base font-semibold text-yellow-400">
                    {formatNumber(systemData.totalTargetMeters)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 w-full">
          <h2 className="text-2xl font-bold text-gray-200 text-center mb-6">
            BIỂU ĐỒ NHIỆT TRẠNG THÁI MÁY
          </h2>
          <div className="relative h-[628px] w-full">
            <ReactECharts
              option={heatmapOption}
              style={{ height: "104%", width: "100%" }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

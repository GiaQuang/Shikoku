// "use client";
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { useInterval } from "usehooks-ts";
// import * as echarts from "echarts";
// import { api_get_error_machines, api_get_main_data } from "../api";

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
//   | "e13"
//   | "e14";

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

// type ProcessedMachineData = {
//   id: string;
//   efficiency: number;
//   targetMeters: number;
//   actualMeters: number;
//   targetRpm: number;
//   actualRpm: number;
//   status: ErrorCode | "running" | "stopped" | "off";
//   errorMessage?: string;
//   history: MachineData["history"];
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
//   e14: { message: "Đạt chiều dài", color: "#a855f7" },
// };

// const statusColors = {
//   running: "#22c55e",
//   stopped: "#1d4ed8",
//   off: "#6b7280",
//   ...Object.fromEntries(
//     Object.entries(errorCodes).map(([code, { color }]) => [code, color])
//   ),
// };

// export default function Home() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [autoScroll, setAutoScroll] = useState(false);
//   const [scrollInterval, setScrollInterval] = useState(5);
//   const [machinesData, setMachinesData] = useState<ProcessedMachineData[]>([]);
//   const machinesPerPage = 10;
//   const totalMachines = 200;
//   const totalPages = Math.ceil(totalMachines / machinesPerPage);

//   const processMachineData = useCallback(
//     (machines: MachineData[]): ProcessedMachineData[] => {
//       return machines.map((machine) => {
//         const latestStatus = machine.history[machine.history.length - 1] || {};
//         const status =
//           latestStatus.ma_loi || (latestStatus.status ? "running" : "stopped");

//         return {
//           id: `MÁY ${String(machine.id + 1).padStart(2, "0")}`,
//           efficiency: machine.hieu_suat,
//           targetMeters: machine.so_met_dat,
//           actualMeters: machine.so_met_thuc,
//           targetRpm: machine.toc_do_dat,
//           actualRpm: machine.toc_do_thuc,
//           status,
//           errorMessage: latestStatus.ma_loi
//             ? errorCodes[latestStatus.ma_loi]?.message
//             : undefined,
//           history: machine.history,
//         };
//       });
//     },
//     []
//   );

//   const updateMachineData = useCallback((newData: ProcessedMachineData[]) => {
//     setMachinesData((prevData) => {
//       if (prevData.length === 0) return newData; // Khởi tạo lần đầu

//       const updatedData = [...prevData];
//       let hasChanges = false;

//       newData.forEach((newMachine) => {
//         const index = updatedData.findIndex((m) => m.id === newMachine.id);
//         if (index !== -1) {
//           const prevHistory = updatedData[index].history;
//           const newHistory = newMachine.history;
//           const hasHistoryChanged =
//             JSON.stringify(prevHistory) !== JSON.stringify(newHistory);

//           if (hasHistoryChanged) {
//             updatedData[index] = newMachine;
//             hasChanges = true;
//           }
//         } else {
//           updatedData.push(newMachine);
//           hasChanges = true;
//         }
//       });

//       return hasChanges ? updatedData : prevData; // Chỉ cập nhật nếu có thay đổi
//     });
//   }, []);

//   const fetchMachineData = useCallback(async () => {
//     try {
//       const res = await api_get_error_machines();
//       if (!res) {
//         console.log("Lỗi khi lấy dữ liệu lỗi máy!");
//         return;
//       }

//       const data = res instanceof Response ? await res.json() : res;
//       console.log("Dữ liệu lỗi máy:", data);

//       if (data?.machines) {
//         const processedData = processMachineData(data.machines);
//         updateMachineData(processedData);
//       }
//     } catch (error) {
//       console.log("Lỗi khi lấy dữ liệu lỗi máy!", error);
//     }
//   }, [processMachineData, updateMachineData]);

//   useInterval(() => {
//     fetchMachineData();
//   }, 1000); // Gọi API mỗi 1 giây

//   useEffect(() => {
//     fetchMachineData(); // Gọi lần đầu khi mount
//   }, [fetchMachineData]);

//   useEffect(() => {
//     let timer: NodeJS.Timeout;

//     if (autoScroll && machinesData.length > 0) {
//       timer = setInterval(() => {
//         setCurrentPage((current) => {
//           if (current >= totalPages) return 1;
//           return current + 1;
//         });
//       }, scrollInterval * 1000);
//     }

//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [autoScroll, scrollInterval, totalPages, machinesData]);

//   const getStatusColor = useCallback(
//     (status: ErrorCode | "running" | "stopped" | "off") => {
//       return statusColors[status] || "#a855f7";
//     },
//     []
//   );

//   const getCurrentPageMachines = useCallback(() => {
//     const startIndex = (currentPage - 1) * machinesPerPage;
//     return machinesData.slice(startIndex, startIndex + machinesPerPage);
//   }, [currentPage, machinesData]);

//   const StatusLegend = React.memo(() => {
//     const errorItems = [
//       { label: "Đứt sợi trên", color: "#ef4444" },
//       { label: "Đứt sợi dưới", color: "#ef4444" },
//       { label: "Đứt lõi cách điện", color: "#93c5fd" },
//       { label: "Đứt băng nhôm", color: "#f97316" },
//       { label: "Lỗi khác", color: "#a855f7" },
//     ];

//     const statusItems = [
//       { label: "Máy chạy", color: "#22c55e" },
//       { label: "Máy dừng", color: "#1d4ed8" },
//       { label: "Máy tắt", color: "#6b7280" },
//       { label: "Thời gian còn lại", color: "#ffffff" },
//     ];

//     const LegendItem = ({
//       item,
//     }: {
//       item: { label: string; color: string };
//     }) => (
//       <div className="flex items-center gap-2">
//         <div
//           className="w-4 h-4 rounded-full shrink-0"
//           style={{ backgroundColor: item.color }}
//         />
//         <span className="text-xl whitespace-nowrap">{item.label}</span>
//       </div>
//     );

//     return (
//       <div className="flex flex-col gap-4">
//         <div className="grid grid-cols-5 gap-x-8">
//           {errorItems.map((item, index) => (
//             <LegendItem key={`error-${index}`} item={item} />
//           ))}
//         </div>
//         <div className="grid grid-cols-5 gap-x-8">
//           {statusItems.map((item, index) => (
//             <LegendItem key={`status-${index}`} item={item} />
//           ))}
//         </div>
//       </div>
//     );
//   });
//   StatusLegend.displayName = "StatusLegend";
//   const MachineCard = React.memo(
//     ({ machine }: { machine: ProcessedMachineData }) => {
//       const chartRef = useRef<HTMLDivElement>(null);
//       const chartInstance = useRef<echarts.ECharts | null>(null);

//       useEffect(() => {
//         if (chartRef.current && machine.history.length > 0) {
//           if (!chartInstance.current) {
//             chartInstance.current = echarts.init(chartRef.current);
//           }

//           const timelineData = machine.history.map((record, index) => {
//             const startTime = new Date(record.timestamp);
//             const endTime =
//               index < machine.history.length - 1
//                 ? new Date(machine.history[index + 1].timestamp)
//                 : new Date();

//             const duration =
//               (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

//             return {
//               start: startTime,
//               end: endTime,
//               duration,
//               status: record.ma_loi || (record.status ? "running" : "stopped"),
//               statusText: record.ma_loi
//                 ? errorCodes[record.ma_loi]?.message
//                 : record.status
//                 ? "Đang chạy"
//                 : "Đang dừng",
//             };
//           });
//           MachineCard.displayName = "MachineCard";

//           const pieData = timelineData.map((item, index) => ({
//             value: item.duration,
//             name: item.statusText,
//             itemStyle: { color: statusColors[item.status] },
//             label: {
//               show: false,
//               formatter: `{b|${item.statusText.toUpperCase()}}\n{d|${item.duration.toFixed(
//                 1
//               )}h}`,
//               rich: {
//                 b: { fontWeight: "bold", fontSize: 10, color: "#fff" },
//                 d: { fontSize: 8, color: "#ddd" },
//               },
//             },
//           }));

//           const option = {
//             tooltip: {
//               trigger: "item",
//               formatter: (params: any) => {
//                 const data = timelineData[params.dataIndex];
//                 return `
//                 <div><strong>${machine.id}</strong></div>
//                 <div>Trạng thái: ${data.statusText}</div>
//                 <div>Thời gian: ${data.start.toLocaleTimeString()} - ${data.end.toLocaleTimeString()}</div>
//                 <div>Kéo dài: ${data.duration.toFixed(2)} giờ</div>
//               `;
//               },
//             },
//             series: [
//               {
//                 type: "pie",
//                 radius: ["40%", "70%"],
//                 avoidLabelOverlap: false,
//                 label: { show: false },
//                 labelLine: { show: false },
//                 data: pieData,
//                 emphasis: {
//                   itemStyle: {
//                     shadowBlur: 10,
//                     shadowColor: "rgba(0, 0, 0, 0.5)",
//                   },
//                 },
//               },
//             ],
//             graphic: {
//               type: "text",
//               left: "center",
//               top: "center",
//               style: {
//                 text: `${machine.efficiency.toFixed(1)}%`,
//                 textAlign: "center",
//                 fill: "#fff",
//                 fontSize: 20,
//                 fontWeight: "bold",
//               },
//             },
//           };

//           chartInstance.current.setOption(option, true); // true để merge options thay vì replace
//         }
//       }, [machine.history, machine.efficiency]);

//       useEffect(() => {
//         return () => {
//           if (chartInstance.current) {
//             chartInstance.current.dispose();
//           }
//         };
//       }, []);

//       return (
//         <div className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
//           <h2 className="text-center text-2xl font-bold">{machine.id}</h2>
//           <div className="w-48 h-48 mx-auto relative">
//             <div ref={chartRef} className="w-full h-full"></div>
//           </div>
//           <div className="grid grid-cols-2 gap-2 text-xl w-full">
//             <div className="flex flex-col">
//               <span className="font-semibold text-gray-400 ml-2">
//                 Số mét đặt
//               </span>
//               <span className="ml-2">
//                 {machine.targetMeters.toLocaleString()} M
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="font-semibold text-gray-400 mr-2 text-right">
//                 Số mét thực
//               </span>
//               <span className="mr-2 text-right">
//                 {machine.actualMeters.toLocaleString()} M
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="font-semibold text-gray-400 ml-2">
//                 Tốc độ đặt
//               </span>
//               <span className="ml-2">{machine.targetRpm} Rpm</span>
//             </div>
//             <div className="flex flex-col">
//               <span className="font-semibold text-gray-400 text-right mr-2">
//                 Tốc độ thực
//               </span>
//               <span className="mr-2 text-right">{machine.actualRpm} Rpm</span>
//             </div>
//           </div>
//           <div className="mt-3 flex justify-between">
//             <span className="font-semibold ml-2 text-xl">Trạng thái:</span>
//             <span
//               className="text-right text-lg"
//               style={{ color: getStatusColor(machine.status) }}
//             >
//               {machine.errorMessage ||
//                 (machine.status === "running"
//                   ? "Đang chạy"
//                   : machine.status === "stopped"
//                   ? "Đang dừng"
//                   : "Máy tắt")}
//             </span>
//           </div>
//         </div>
//       );
//     }
//   );

//   const Pagination = React.memo(() => {
//     const [pageInput, setPageInput] = useState(currentPage.toString());

//     const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       const value = e.target.value;
//       if (/^\d*$/.test(value)) {
//         setPageInput(value);
//       }
//     };

//     const handlePageSubmit = () => {
//       const newPage = Number(pageInput);
//       if (newPage >= 1 && newPage <= totalPages) {
//         setCurrentPage(newPage);
//       } else {
//         setPageInput(currentPage.toString());
//       }
//     };

//     useEffect(() => {
//       setPageInput(currentPage.toString());
//     }, [currentPage]);

//     return (
//       <div className="flex items-center gap-8">
//         <div className="flex items-center gap-4">
//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={autoScroll}
//               onChange={(e) => setAutoScroll(e.target.checked)}
//               className="w-4 h-4"
//             />
//             <span>Tự động chuyển</span>
//           </label>

//           <div className="flex items-center gap-2">
//             <span>Thời gian:</span>
//             <input
//               type="number"
//               min="1"
//               max="60"
//               value={scrollInterval}
//               onChange={(e) => setScrollInterval(Number(e.target.value))}
//               className="w-16 p-1 text-center bg-gray-800 text-white border rounded"
//             />
//             <span>giây</span>
//           </div>
//         </div>

//         <div className="flex items-center gap-4 border-l border-gray-700 pl-8">
//           <button
//             onClick={() => setCurrentPage(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="p-2 bg-gray-700 rounded disabled:opacity-50"
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
//             <span>Trang</span>
//             <input
//               type="text"
//               value={pageInput}
//               onChange={handlePageChange}
//               onBlur={handlePageSubmit}
//               onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
//               className="w-12 p-1 text-center bg-gray-800 text-white border rounded"
//             />
//             <span>/{totalPages}</span>
//           </div>

//           <button
//             onClick={() => setCurrentPage(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="p-2 bg-gray-700 rounded disabled:opacity-50"
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
//   });
//   Pagination.displayName = "Pagination";

//   return (
//     <main className="min-h-screen bg-gray-900">
//       <div className="p-2 text-white">
//         <h1 className="text-2xl mb-4 text-center">
//           Dashboard - Trạng thái máy
//         </h1>

//         {machinesData.length > 0 ? (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//               {getCurrentPageMachines().map((machine) => (
//                 <MachineCard key={machine.id} machine={machine} />
//               ))}
//             </div>

//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-gray-700">
//               <StatusLegend />
//               <Pagination />
//             </div>
//           </>
//         ) : (
//           <div className="text-center py-8">
//             <p className="text-xl">Đang tải dữ liệu máy...</p>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }
//!--------------------------------------------------------------------------
// "use client";
// import React, { useState, useEffect, useRef, useCallback } from "react";
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

// type ProcessedMachineData = {
//   id: string;
//   efficiency: number;
//   targetMeters: number;
//   actualMeters: number;
//   targetRpm: number;
//   actualRpm: number;
//   status: ErrorCode | "running" | "stopped" | "off";
//   errorMessage?: string;
//   history: MachineData["history"];
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

// const statusColors = {
//   running: "#22c55e",
//   stopped: "#1d4ed8",
//   off: "#6b7280",
//   ...Object.fromEntries(
//     Object.entries(errorCodes).map(([code, { color }]) => [code, color])
//   ),
// };

// export default function Home() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [autoScroll, setAutoScroll] = useState(false);
//   const [scrollInterval, setScrollInterval] = useState(5);
//   const [machinesData, setMachinesData] = useState<ProcessedMachineData[]>([]);
//   const machinesPerPage = 10;
//   const totalMachines = 200;
//   const totalPages = Math.ceil(totalMachines / machinesPerPage);

//   const getErrorCode = (regs: number[]): ErrorCode | null => {
//     if (!regs || regs.length < 7) {
//       console.log("Dữ liệu regs không đủ (dưới 7 phần tử):", regs);
//       return null;
//     }

//     const reg0 = regs[0] || 0;
//     const reg0Binary = reg0.toString(2).padStart(16, "0");
//     const reg0Bits = reg0Binary.slice(-6);
//     const errorE03 = reg0Bits[4] === "1" ? "e03" : null;
//     const errorE04 = reg0Bits[3] === "1" ? "e04" : null;

//     console.log(
//       `regs[0]=${reg0}, binary=${reg0Binary}, 6 bits cuối=${reg0Bits}, errorsFromReg0=`,
//       [errorE03, errorE04].filter(Boolean)
//     );

//     const reg6 = regs[6] || 0;
//     const reg6Binary = reg6.toString(2).padStart(16, "0");
//     const reg6Bits = reg6Binary.slice(-11);
//     const errorsFromReg6 = [
//       reg6Bits[10] === "1" ? "e01" : null,
//       reg6Bits[9] === "1" ? "e02" : null,
//       reg6Bits[8] === "1" ? "e05" : null,
//       reg6Bits[7] === "1" ? "e06" : null,
//       reg6Bits[6] === "1" ? "e07" : null,
//       reg6Bits[5] === "1" ? "e08" : null,
//       reg6Bits[4] === "1" ? "e09" : null,
//       reg6Bits[3] === "1" ? "e10" : null,
//       reg6Bits[2] === "1" ? "e11" : null,
//       reg6Bits[1] === "1" ? "e12" : null,
//       reg6Bits[0] === "1" ? "e13" : null,
//     ].filter((e): e is ErrorCode => e !== null);

//     console.log(
//       `regs[6]=${reg6}, binary=${reg6Binary}, 11 bits cuối=${reg6Bits}, errorsFromReg6=`,
//       errorsFromReg6
//     );

//     const allErrors = [...errorsFromReg6, errorE03, errorE04].filter(
//       (e): e is ErrorCode => e !== null
//     );
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
//   };

//   const processMachineData = useCallback(
//     (nodes: any[]): ProcessedMachineData[] => {
//       const machines: MachineData[] = [];
//       const currentTime = new Date().toISOString();
//       const oneDayMs = 24 * 60 * 60 * 1000;
//       const maxHistoryRecords = 100;

//       console.log(
//         "Dữ liệu máy từ API:",
//         nodes.flatMap((node) =>
//           node.data?.map((m: any) => ({
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

//       nodes.forEach((node: any) => {
//         if (node.connection && node.data && Array.isArray(node.data)) {
//           node.data.forEach((machine: any) => {
//             if (!machine.ip || !machine.regs) return;

//             const ipParts = machine.ip.split(".");
//             const ipLastPart = parseInt(ipParts[3]);
//             if (ipLastPart < 11 || ipLastPart > 210) return;

//             const id = ipLastPart - 10;
//             const regs = Array.isArray(machine.regs) ? machine.regs : [];
//             const so_met_dat = regs[3] ? regs[3] / 10 : 0;
//             const so_met_thuc = regs[4] ? regs[4] / 10 : 0;
//             const toc_do_dat = regs[1] ? regs[1] / 10 : 0;
//             const toc_do_thuc = regs[2] ? regs[2] / 10 : 0;
//             const ma_loi = getErrorCode(regs);
//             const fps = typeof machine.fps === "number" ? machine.fps : 0;
//             const timestamp =
//               machine.last_time_ok || node.last_update || currentTime;
//             const startTime =
//               machine.last_time_ok ||
//               new Date().setHours(0, 0, 0, 0).toString();
//             const reg0 = regs[0] || 0;
//             const reg0Binary = reg0.toString(2).padStart(16, "0");
//             const reg0Bits = reg0Binary.slice(-6);
//             const isRunning = reg0Bits[1] === "1";

//             let status: boolean;
//             let statusLabel: string;
//             if (ma_loi) {
//               status = false;
//               statusLabel = errorCodes[ma_loi].message;
//             } else if (!machine.connection) {
//               status = false;
//               statusLabel = "Máy tắt";
//             } else if (machine.connection && fps === 0) {
//               status = false;
//               statusLabel = "Máy dừng";
//             } else if (
//               machine.connection &&
//               fps > 0 &&
//               isRunning &&
//               toc_do_thuc > 0
//             ) {
//               status = true;
//               statusLabel = "Máy chạy";
//             } else {
//               status = false;
//               statusLabel = "Máy dừng";
//             }

//             console.log(`Máy ${id} (IP: ${machine.ip}):`, {
//               status,
//               statusLabel,
//               ma_loi,
//               connection: machine.connection,
//               fps,
//               bitRunning: reg0Bits[1],
//               toc_do_thuc,
//               timestamp,
//             });

//             let existingMachine = machines.find((m) => m.id === id);
//             if (!existingMachine) {
//               existingMachine = {
//                 id,
//                 hieu_suat: 0,
//                 so_met_dat,
//                 so_met_thuc,
//                 toc_do_dat,
//                 toc_do_thuc,
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
//               lastRecord.ma_loi !== ma_loi
//             ) {
//               existingMachine.history.push({
//                 timestamp,
//                 status,
//                 ma_loi,
//               });
//               console.log(`Cập nhật history máy ${id}:`, {
//                 timestamp,
//                 status,
//                 ma_loi,
//               });
//             } else {
//               console.log(
//                 `Không thay đổi trạng thái máy ${id}, bỏ qua cập nhật history`
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

//             console.log(`History máy ${id}:`, existingMachine.history);

//             const startTimeMs = new Date(startTime).getTime();
//             const T_ms = Math.min(
//               new Date(currentTime).getTime() - startTimeMs,
//               oneDayMs
//             );
//             const T_seconds = T_ms / 1000;
//             const t_seconds = existingMachine.history.reduce(
//               (sum, h) => sum + (h.status ? 1 : 0),
//               0
//             );
//             existingMachine.hieu_suat =
//               T_seconds > 0 ? (t_seconds / T_seconds) * 100 : 0;

//             existingMachine.so_met_dat = so_met_dat;
//             existingMachine.so_met_thuc = so_met_thuc;
//             existingMachine.toc_do_dat = toc_do_dat;
//             existingMachine.toc_do_thuc = toc_do_thuc;
//           });
//         }
//       });

//       for (let i = 1; i <= totalMachines; i++) {
//         if (!machines.find((m) => m.id === i)) {
//           machines.push({
//             id: i,
//             hieu_suat: 0,
//             so_met_dat: 0,
//             so_met_thuc: 0,
//             toc_do_dat: 0,
//             toc_do_thuc: 0,
//             startTime: new Date().setHours(0, 0, 0, 0).toString(),
//             history: [{ timestamp: currentTime, status: false, ma_loi: null }],
//           });
//         }
//       }
//       machines.sort((a, b) => a.id - b.id);

//       const machine1 = machines.find((m) => m.id === 1);
//       if (machine1) {
//         console.log(`Máy 1 (IP: 192.168.110.11):`, {
//           hieu_suat: machine1.hieu_suat.toFixed(1) + "%",
//           so_met_dat: machine1.so_met_dat,
//           so_met_thuc: machine1.so_met_thuc,
//           toc_do_dat: machine1.toc_do_dat,
//           toc_do_thuc: machine1.toc_do_thuc,
//           startTime: machine1.startTime,
//           latestStatus: machine1.history[machine1.history.length - 1],
//           historyLength: machine1.history.length,
//         });
//       }

//       return machines.map((machine) => {
//         const latestStatus = machine.history[machine.history.length - 1] || {};
//         const status =
//           latestStatus.ma_loi ||
//           (latestStatus.status
//             ? "running"
//             : machine.connection
//             ? "stopped"
//             : "off");

//         return {
//           id: `MÁY ${String(machine.id).padStart(2, "0")}`,
//           efficiency: machine.hieu_suat,
//           targetMeters: machine.so_met_dat,
//           actualMeters: machine.so_met_thuc,
//           targetRpm: machine.toc_do_dat,
//           actualRpm: machine.toc_do_thuc,
//           status,
//           errorMessage: latestStatus.ma_loi
//             ? errorCodes[latestStatus.ma_loi]?.message
//             : undefined,
//           history: machine.history,
//         };
//       });
//     },
//     []
//   );

//   const updateMachineData = useCallback((newData: ProcessedMachineData[]) => {
//     setMachinesData((prevData) => {
//       if (prevData.length === 0) return newData;

//       const updatedData = [...prevData];
//       let hasChanges = false;

//       newData.forEach((newMachine) => {
//         const index = updatedData.findIndex((m) => m.id === newMachine.id);
//         if (index !== -1) {
//           const prevHistory = updatedData[index].history;
//           const newHistory = newMachine.history;
//           const hasHistoryChanged =
//             JSON.stringify(prevHistory) !== JSON.stringify(newHistory);

//           if (
//             hasHistoryChanged ||
//             updatedData[index].efficiency !== newMachine.efficiency ||
//             updatedData[index].targetMeters !== newMachine.targetMeters ||
//             updatedData[index].actualMeters !== newMachine.actualMeters ||
//             updatedData[index].targetRpm !== newMachine.targetRpm ||
//             updatedData[index].actualRpm !== newMachine.actualRpm ||
//             updatedData[index].status !== newMachine.status
//           ) {
//             updatedData[index] = newMachine;
//             hasChanges = true;
//           }
//         } else {
//           updatedData.push(newMachine);
//           hasChanges = true;
//         }
//       });

//       if (hasChanges) {
//         updatedData.sort((a, b) => {
//           const idA = parseInt(a.id.replace("MÁY ", ""));
//           const idB = parseInt(b.id.replace("MÁY ", ""));
//           return idA - idB;
//         });
//       }

//       return hasChanges ? updatedData : prevData;
//     });
//   }, []);

//   const fetchMachineData = useCallback(async () => {
//     try {
//       const res = await api_get_main_data();
//       if (!res) {
//         console.log("Lỗi: Không nhận được dữ liệu từ API");
//         return;
//       }

//       console.log("Dữ liệu thô từ API:", res);
//       const data = res instanceof Response ? await res.json() : res;

//       let nodes: any[] = [];
//       if (Array.isArray(data)) {
//         nodes = data;
//       } else if (data && typeof data === "object") {
//         const possibleKeys = ["nodes", "data", "result", "machines"];
//         const foundKey = possibleKeys.find((key) => Array.isArray(data[key]));
//         if (foundKey) {
//           nodes = data[foundKey];
//         } else {
//           console.error("Dữ liệu không chứa mảng node:", data);
//           return;
//         }
//       } else {
//         console.error("Dữ liệu không phải mảng hoặc object:", data);
//         return;
//       }

//       const processedData = processMachineData(nodes);
//       updateMachineData(processedData);
//     } catch (error) {
//       console.error("Lỗi khi lấy dữ liệu:", error);
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

//     if (autoScroll && machinesData.length > 0) {
//       timer = setInterval(() => {
//         setCurrentPage((current) => {
//           if (current >= totalPages) return 1;
//           return current + 1;
//         });
//       }, scrollInterval * 1000);
//     }

//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [autoScroll, scrollInterval, totalPages, machinesData]);

//   const getStatusColor = useCallback(
//     (status: ErrorCode | "running" | "stopped" | "off") => {
//       return statusColors[status] || "#a855f7";
//     },
//     []
//   );

//   const getCurrentPageMachines = useCallback(() => {
//     const startIndex = (currentPage - 1) * machinesPerPage;
//     const endIndex = startIndex + machinesPerPage;
//     const pageMachines = machinesData.slice(startIndex, endIndex);

//     console.log(
//       `Trang ${currentPage}:`,
//       pageMachines.map((m) => m.id)
//     );

//     return pageMachines;
//   }, [currentPage, machinesData]);

//   const StatusLegend = React.memo(() => {
//     const errorItems = [
//       { label: "Đứt sợi trên", color: "#ef4444" },
//       { label: "Đứt sợi dưới", color: "#ef4444" },
//       { label: "Đứt lõi cách điện", color: "#93c5fd" },
//       { label: "Đứt băng nhôm", color: "#f97316" },
//       { label: "Lỗi khác", color: "#a855f7" },
//     ];

//     const statusItems = [
//       { label: "Máy chạy", color: "#22c55e" },
//       { label: "Máy dừng", color: "#1d4ed8" },
//       { label: "Máy tắt", color: "#6b7280" },
//       { label: "Thời gian còn lại", color: "#ffffff" },
//     ];

//     const LegendItem = ({
//       item,
//     }: {
//       item: { label: string; color: string };
//     }) => (
//       <div className="flex items-center gap-2">
//         <div
//           className="w-4 h-4 rounded-full shrink-0"
//           style={{ backgroundColor: item.color }}
//         />
//         <span className="text-xl whitespace-nowrap">{item.label}</span>
//       </div>
//     );

//     return (
//       <div className="flex flex-col gap-4">
//         <div className="grid grid-cols-5 gap-x-8">
//           {errorItems.map((item, index) => (
//             <LegendItem key={`error-${index}`} item={item} />
//           ))}
//         </div>
//         <div className="grid grid-cols-5 gap-x-8">
//           {statusItems.map((item, index) => (
//             <LegendItem key={`status-${index}`} item={item} />
//           ))}
//         </div>
//       </div>
//     );
//   });
//   StatusLegend.displayName = "StatusLegend";

//   const MachineCard = React.memo(
//     ({ machine }: { machine: ProcessedMachineData }) => {
//       const chartRef = useRef<HTMLDivElement>(null);
//       const chartInstance = useRef<echarts.ECharts | null>(null);

//       useEffect(() => {
//         if (chartRef.current && machine.history.length > 0) {
//           if (!chartInstance.current) {
//             chartInstance.current = echarts.init(chartRef.current);
//           }

//           const now = new Date();
//           const baseDate = new Date(now);
//           baseDate.setHours(6, 0, 0, 0);
//           if (now.getHours() < 6) {
//             baseDate.setDate(baseDate.getDate() - 1);
//           }
//           const startTime = baseDate.getTime();
//           const endTime = startTime + 24 * 60 * 60 * 1000;
//           const currentTime = Math.min(now.getTime(), endTime);

//           console.log(`Khoảng thời gian biểu đồ tròn máy ${machine.id}:`, {
//             startTime: new Date(startTime).toISOString(),
//             endTime: new Date(endTime).toISOString(),
//             currentTime: new Date(currentTime).toISOString(),
//           });

//           const sortedHistory = [...machine.history]
//             .sort(
//               (a, b) =>
//                 new Date(a.timestamp).getTime() -
//                 new Date(b.timestamp).getTime()
//             )
//             .filter(
//               (h) =>
//                 new Date(h.timestamp).getTime() >= startTime &&
//                 new Date(h.timestamp).getTime() <= endTime
//             );

//           console.log(`History được lọc máy ${machine.id}:`, sortedHistory);

//           const timelineData: {
//             status: string;
//             statusText: string;
//             duration: number;
//           }[] = [];
//           let lastEndTime = startTime;

//           if (sortedHistory.length === 0) {
//             const offDuration = (endTime - startTime) / (1000 * 60 * 60);
//             if (offDuration > 0) {
//               timelineData.push({
//                 status: "off",
//                 statusText: "Máy tắt",
//                 duration: offDuration,
//               });
//             }
//           } else {
//             sortedHistory.forEach((record, index) => {
//               const start = Math.max(
//                 new Date(record.timestamp).getTime(),
//                 startTime
//               );
//               if (start > endTime) return;

//               const nextRecordTime =
//                 index < sortedHistory.length - 1
//                   ? new Date(sortedHistory[index + 1].timestamp).getTime()
//                   : currentTime;
//               const end = Math.min(nextRecordTime, endTime);
//               const duration = (end - start) / (1000 * 60 * 60);

//               if (start > lastEndTime) {
//                 const offDuration = (start - lastEndTime) / (1000 * 60 * 60);
//                 if (offDuration > 0) {
//                   timelineData.push({
//                     status: "off",
//                     statusText: "Máy tắt",
//                     duration: offDuration,
//                   });
//                 }
//               }

//               const status =
//                 record.ma_loi || (record.status ? "running" : "stopped");
//               const statusText = record.ma_loi
//                 ? errorCodes[record.ma_loi].message
//                 : record.status
//                 ? "Đang chạy"
//                 : "Đang dừng";

//               if (duration > 0) {
//                 timelineData.push({
//                   status,
//                   statusText,
//                   duration,
//                 });
//               }

//               lastEndTime = end;
//             });
//           }

//           if (lastEndTime < endTime) {
//             const remainingDuration =
//               (endTime - lastEndTime) / (1000 * 60 * 60);
//             if (remainingDuration > 0) {
//               timelineData.push({
//                 status: "off",
//                 statusText: "Thời gian còn lại",
//                 duration: remainingDuration,
//               });
//             }
//           }

//           const pieData = timelineData.reduce(
//             (acc, curr) => {
//               const existing = acc.find(
//                 (item) => item.name === curr.statusText
//               );
//               if (existing) {
//                 existing.value += curr.duration;
//               } else {
//                 acc.push({
//                   value: curr.duration,
//                   name: curr.statusText,
//                   itemStyle: { color: statusColors[curr.status] },
//                   label: {
//                     show: false,
//                     formatter: `{b|${curr.statusText.toUpperCase()}}\n{d|${curr.duration.toFixed(
//                       1
//                     )}h}`,
//                     rich: {
//                       b: { fontWeight: "bold", fontSize: 10, color: "#fff" },
//                       d: { fontSize: 8, color: "#ddd" },
//                     },
//                   },
//                 });
//               }
//               return acc;
//             },
//             [] as Array<{
//               value: number;
//               name: string;
//               itemStyle: { color: string };
//               label: any;
//             }>
//           );

//           console.log(`Biểu đồ tròn máy ${machine.id}:`, {
//             timelineData,
//             pieData: pieData.map((item) => ({
//               name: item.name,
//               duration: item.value.toFixed(2) + "h",
//               color: item.itemStyle.color,
//             })),
//           });

//           const option = {
//             tooltip: {
//               trigger: "item",
//               formatter: (params: any) => {
//                 const data = pieData[params.dataIndex];
//                 return `
//                 <div><strong>${machine.id}</strong></div>
//                 <div>Trạng thái: ${data.name}</div>
//                 <div>Thời gian: ${data.value.toFixed(2)} giờ</div>
//                 <div>Tỷ lệ: ${params.percent.toFixed(1)}%</div>
//               `;
//               },
//             },
//             series: [
//               {
//                 type: "pie",
//                 radius: ["40%", "70%"],
//                 avoidLabelOverlap: false,
//                 label: { show: false },
//                 labelLine: { show: false },
//                 data: pieData,
//                 emphasis: {
//                   itemStyle: {
//                     shadowBlur: 10,
//                     shadowColor: "rgba(0, 0, 0, 0.5)",
//                   },
//                 },
//               },
//             ],
//             graphic: {
//               type: "text",
//               left: "center",
//               top: "center",
//               style: {
//                 text: `${machine.efficiency.toFixed(1)}%`,
//                 textAlign: "center",
//                 fill: "#fff",
//                 fontSize: 20,
//                 fontWeight: "bold",
//               },
//             },
//           };

//           chartInstance.current.setOption(option, true);
//         }
//       }, [machine.history, machine.efficiency]);

//       useEffect(() => {
//         const resizeObserver = new ResizeObserver(() => {
//           if (chartInstance.current) {
//             chartInstance.current.resize();
//           }
//         });
//         if (chartRef.current) {
//           resizeObserver.observe(chartRef.current);
//         }
//         return () => {
//           resizeObserver.disconnect();
//           if (chartInstance.current) {
//             chartInstance.current.dispose();
//             chartInstance.current = null;
//           }
//         };
//       }, []);

//       return (
//         <div className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
//           <h2 className="text-center text-2xl font-bold">{machine.id}</h2>
//           <div className="w-48 h-48 mx-auto relative">
//             <div ref={chartRef} className="w-full h-full"></div>
//           </div>
//           <div className="grid grid-cols-2 gap-2 text-xl w-full">
//             <div className="flex flex-col">
//               <span className="font-semibold text-gray-400 ml-2">
//                 Số mét đặt
//               </span>
//               <span className="ml-2">
//                 {machine.targetMeters.toLocaleString()} M
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="font-semibold text-gray-400 mr-2 text-right">
//                 Số mét thực
//               </span>
//               <span className="mr-2 text-right">
//                 {machine.actualMeters.toLocaleString()} M
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="font-semibold text-gray-400 ml-2">
//                 Tốc độ đặt
//               </span>
//               <span className="ml-2">{machine.targetRpm} Rpm</span>
//             </div>
//             <div className="flex flex-col">
//               <span className="font-semibold text-gray-400 text-right mr-2">
//                 Tốc độ thực
//               </span>
//               <span className="mr-2 text-right">{machine.actualRpm} Rpm</span>
//             </div>
//           </div>
//           <div className="mt-3 flex justify-between">
//             <span className="font-semibold ml-2 text-xl">Trạng thái:</span>
//             <span
//               className="text-right text-lg"
//               style={{ color: getStatusColor(machine.status) }}
//             >
//               {machine.errorMessage ||
//                 (machine.status === "running"
//                   ? "Đang chạy"
//                   : machine.status === "stopped"
//                   ? "Đang dừng"
//                   : "Máy tắt")}
//             </span>
//           </div>
//         </div>
//       );
//     }
//   );
//   MachineCard.displayName = "MachineCard";

//   const Pagination = React.memo(() => {
//     const [pageInput, setPageInput] = useState(currentPage.toString());

//     const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       const value = e.target.value;
//       if (/^\d*$/.test(value)) {
//         setPageInput(value);
//       }
//     };

//     const handlePageSubmit = () => {
//       const newPage = Number(pageInput);
//       if (newPage >= 1 && newPage <= totalPages) {
//         setCurrentPage(newPage);
//       } else {
//         setPageInput(currentPage.toString());
//       }
//     };

//     useEffect(() => {
//       setPageInput(currentPage.toString());
//     }, [currentPage]);

//     return (
//       <div className="flex items-center gap-8">
//         <div className="flex items-center gap-4">
//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={autoScroll}
//               onChange={(e) => setAutoScroll(e.target.checked)}
//               className="w-4 h-4"
//             />
//             <span>Tự động chuyển</span>
//           </label>

//           <div className="flex items-center gap-2">
//             <span>Thời gian:</span>
//             <input
//               type="number"
//               min="1"
//               max="60"
//               value={scrollInterval}
//               onChange={(e) => setScrollInterval(Number(e.target.value))}
//               className="w-16 p-1 text-center bg-gray-800 text-white border rounded"
//             />
//             <span>giây</span>
//           </div>
//         </div>

//         <div className="flex items-center gap-4 border-l border-gray-700 pl-8">
//           <button
//             onClick={() => setCurrentPage(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="p-2 bg-gray-700 rounded disabled:opacity-50"
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
//             <span>Trang</span>
//             <input
//               type="text"
//               value={pageInput}
//               onChange={handlePageChange}
//               onBlur={handlePageSubmit}
//               onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
//               className="w-12 p-1 text-center bg-gray-800 text-white border rounded"
//             />
//             <span>/{totalPages}</span>
//           </div>

//           <button
//             onClick={() => setCurrentPage(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="p-2 bg-gray-700 rounded disabled:opacity-50"
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
//   });
//   Pagination.displayName = "Pagination";

//   return (
//     <main className="min-h-screen bg-gray-900">
//       <div className="p-2 text-white">
//         <h1 className="text-2xl mb-4 text-center">
//           Dashboard - Trạng thái máy
//         </h1>

//         {machinesData.length > 0 ? (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//               {getCurrentPageMachines().map((machine) => (
//                 <MachineCard key={machine.id} machine={machine} />
//               ))}
//             </div>

//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-gray-700">
//               <StatusLegend />
//               <Pagination />
//             </div>
//           </>
//         ) : (
//           <div className="text-center py-8">
//             <p className="text-xl">Đang tải dữ liệu máy...</p>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

//!----------------------------------
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  hieu_suat: number;
  so_met_dat: number;
  so_met_thuc: number;
  toc_do_dat: number;
  toc_do_thuc: number;
  startTime: string;
  history: {
    timestamp: string;
    status: boolean;
    ma_loi: ErrorCode | null;
  }[];
};

type ProcessedMachineData = {
  id: string;
  efficiency: number;
  targetMeters: number;
  actualMeters: number;
  targetRpm: number;
  actualRpm: number;
  status: ErrorCode | "running" | "stopped" | "off";
  errorMessage?: string;
  history: MachineData["history"];
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

const statusColors = {
  running: "#22c55e",
  stopped: "#1d4ed8",
  off: "#6b7280",
  ...Object.fromEntries(
    Object.entries(errorCodes).map(([code, { color }]) => [code, color])
  ),
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollInterval, setScrollInterval] = useState(5);
  const [machinesData, setMachinesData] = useState<ProcessedMachineData[]>([]);
  const machinesPerPage = 10;
  const totalMachines = 200;
  const totalPages = Math.ceil(totalMachines / machinesPerPage);

  const getErrorCode = (regs: number[]): ErrorCode | null => {
    if (!regs || regs.length < 7) {
      console.log("Dữ liệu regs không đủ (dưới 7 phần tử):", regs);
      return null;
    }

    const reg0 = regs[0] || 0;
    const reg0Binary = reg0.toString(2).padStart(16, "0");
    const reg0Bits = reg0Binary.slice(-6);
    const errorE03 = reg0Bits[4] === "1" ? "e03" : null;
    const errorE04 = reg0Bits[3] === "1" ? "e04" : null;

    console.log(
      `regs[0]=${reg0}, binary=${reg0Binary}, 6 bits cuối=${reg0Bits}, errorsFromReg0=`,
      [errorE03, errorE04].filter(Boolean)
    );

    const reg6 = regs[6] || 0;
    const reg6Binary = reg6.toString(2).padStart(16, "0");
    const reg6Bits = reg6Binary.slice(-11);
    const errorsFromReg6 = [
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

    console.log(
      `regs[6]=${reg6}, binary=${reg6Binary}, 11 bits cuối=${reg6Bits}, errorsFromReg6=`,
      errorsFromReg6
    );

    const allErrors = [...errorsFromReg6, errorE03, errorE04].filter(
      (e): e is ErrorCode => e !== null
    );
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
  };

  const processMachineData = useCallback(
    (nodes: any[]): ProcessedMachineData[] => {
      const machines: MachineData[] = [];
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
      const endTime = startTime + oneDayMs;

      console.log(
        "Dữ liệu máy từ API:",
        nodes.flatMap((node) =>
          node.data?.map((m: any) => ({
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

      nodes.forEach((node: any) => {
        if (node.connection && node.data && Array.isArray(node.data)) {
          node.data.forEach((machine: any) => {
            if (!machine.ip || !machine.regs) return;

            const ipParts = machine.ip.split(".");
            const ipLastPart = parseInt(ipParts[3]);
            if (ipLastPart < 11 || ipLastPart > 210) return;

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
            let statusLabel: string;
            if (ma_loi) {
              status = false;
              statusLabel = errorCodes[ma_loi].message;
            } else if (!machine.connection) {
              status = false;
              statusLabel = "Máy tắt";
            } else if (machine.connection && fps === 0) {
              status = false;
              statusLabel = "Máy dừng";
            } else if (
              machine.connection &&
              fps > 0 &&
              isRunning &&
              toc_do_thuc > 0
            ) {
              status = true;
              statusLabel = "Máy chạy";
            } else {
              status = false;
              statusLabel = "Máy dừng";
            }

            console.log(`Máy ${id} (IP: ${machine.ip}):`, {
              status,
              statusLabel,
              ma_loi,
              connection: machine.connection,
              fps,
              bitRunning: reg0Bits[1],
              toc_do_thuc,
              timestamp,
            });

            let existingMachine = machines.find((m) => m.id === id);
            if (!existingMachine) {
              existingMachine = {
                id,
                hieu_suat: 0,
                so_met_dat,
                so_met_thuc,
                toc_do_dat,
                toc_do_thuc,
                startTime: new Date(startTime).toISOString(),
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

            existingMachine.history = existingMachine.history
              .filter(
                (h) =>
                  new Date(currentTime).getTime() -
                    new Date(h.timestamp).getTime() <=
                  oneDayMs
              )
              .slice(-maxHistoryRecords);

            console.log(`History máy ${id}:`, existingMachine.history);

            // Tính hiệu suất tức thời: h = (t/T) * 100
            const T_ms = Math.min(currentTime - startTime, oneDayMs);
            const T_hours = T_ms / (1000 * 60 * 60);
            let t_hours = 0;

            if (existingMachine.history.length > 0) {
              const sortedHistory = [...existingMachine.history]
                .sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )
                .filter(
                  (h) =>
                    new Date(h.timestamp).getTime() >= startTime &&
                    new Date(h.timestamp).getTime() <= currentTime
                );

              let lastTime = startTime;
              sortedHistory.forEach((record, index) => {
                const start = Math.max(
                  new Date(record.timestamp).getTime(),
                  startTime
                );
                const end =
                  index < sortedHistory.length - 1
                    ? Math.min(
                        new Date(sortedHistory[index + 1].timestamp).getTime(),
                        currentTime
                      )
                    : currentTime;
                const duration_ms = end - start;
                if (record.status && !record.ma_loi) {
                  t_hours += duration_ms / (1000 * 60 * 60);
                }
                lastTime = end;
              });
            }

            existingMachine.hieu_suat =
              T_hours > 0 ? (t_hours / T_hours) * 100 : 0;

            console.log(`Hiệu suất máy ${id}:`, {
              T_hours: T_hours.toFixed(2),
              t_hours: t_hours.toFixed(2),
              hieu_suat: existingMachine.hieu_suat.toFixed(1) + "%",
            });

            existingMachine.so_met_dat = so_met_dat;
            existingMachine.so_met_thuc = so_met_thuc;
            existingMachine.toc_do_dat = toc_do_dat;
            existingMachine.toc_do_thuc = toc_do_thuc;
          });
        }
      });

      for (let i = 1; i <= totalMachines; i++) {
        if (!machines.find((m) => m.id === i)) {
          const baseDate = new Date(now);
          baseDate.setHours(6, 0, 0, 0);
          if (now.getHours() < 6) {
            baseDate.setDate(baseDate.getDate() - 1);
          }
          machines.push({
            id: i,
            hieu_suat: 0,
            so_met_dat: 0,
            so_met_thuc: 0,
            toc_do_dat: 0,
            toc_do_thuc: 0,
            startTime: baseDate.toISOString(),
            history: [
              {
                timestamp: new Date().toISOString(),
                status: false,
                ma_loi: null,
              },
            ],
          });
        }
      }
      machines.sort((a, b) => a.id - b.id);

      const machine1 = machines.find((m) => m.id === 1);
      if (machine1) {
        console.log(`Máy 1 (IP: 192.168.110.11):`, {
          hieu_suat: machine1.hieu_suat.toFixed(1) + "%",
          so_met_dat: machine1.so_met_dat,
          so_met_thuc: machine1.so_met_thuc,
          toc_do_dat: machine1.toc_do_dat,
          toc_do_thuc: machine1.toc_do_thuc,
          startTime: machine1.startTime,
          latestStatus: machine1.history[machine1.history.length - 1],
          historyLength: machine1.history.length,
        });
      }

      return machines.map((machine) => {
        const latestStatus = machine.history[machine.history.length - 1] || {};
        const status =
          latestStatus.ma_loi ||
          (latestStatus.status
            ? "running"
            : machine.connection
            ? "stopped"
            : "off");

        return {
          id: `MÁY ${String(machine.id).padStart(2, "0")}`,
          efficiency: machine.hieu_suat,
          targetMeters: machine.so_met_dat,
          actualMeters: machine.so_met_thuc,
          targetRpm: machine.toc_do_dat,
          actualRpm: machine.toc_do_thuc,
          status,
          errorMessage: latestStatus.ma_loi
            ? errorCodes[latestStatus.ma_loi]?.message
            : undefined,
          history: machine.history,
        };
      });
    },
    []
  );

  const updateMachineData = useCallback((newData: ProcessedMachineData[]) => {
    setMachinesData((prevData) => {
      if (prevData.length === 0) return newData;

      const updatedData = [...prevData];
      let hasChanges = false;

      newData.forEach((newMachine) => {
        const index = updatedData.findIndex((m) => m.id === newMachine.id);
        if (index !== -1) {
          const prevHistory = updatedData[index].history;
          const newHistory = newMachine.history;
          const hasHistoryChanged =
            JSON.stringify(prevHistory) !== JSON.stringify(newHistory);

          if (
            hasHistoryChanged ||
            updatedData[index].efficiency !== newMachine.efficiency ||
            updatedData[index].targetMeters !== newMachine.targetMeters ||
            updatedData[index].actualMeters !== newMachine.actualMeters ||
            updatedData[index].targetRpm !== newMachine.targetRpm ||
            updatedData[index].actualRpm !== newMachine.actualRpm ||
            updatedData[index].status !== newMachine.status
          ) {
            updatedData[index] = newMachine;
            hasChanges = true;
          }
        } else {
          updatedData.push(newMachine);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        updatedData.sort((a, b) => {
          const idA = parseInt(a.id.replace("MÁY ", ""));
          const idB = parseInt(b.id.replace("MÁY ", ""));
          return idA - idB;
        });
      }

      return hasChanges ? updatedData : prevData;
    });
  }, []);

  const fetchMachineData = useCallback(async () => {
    try {
      const res = await api_get_main_data();
      if (!res) {
        console.log("Lỗi: Không nhận được dữ liệu từ API");
        return;
      }

      console.log("Dữ liệu thô từ API:", res);
      const data = res instanceof Response ? await res.json() : res;

      let nodes: any[] = [];
      if (Array.isArray(data)) {
        nodes = data;
      } else if (data && typeof data === "object") {
        const possibleKeys = ["nodes", "data", "result", "machines"];
        const foundKey = possibleKeys.find((key) => Array.isArray(data[key]));
        if (foundKey) {
          nodes = data[foundKey];
        } else {
          console.error("Dữ liệu không chứa mảng node:", data);
          return;
        }
      } else {
        console.error("Dữ liệu không phải mảng hoặc object:", data);
        return;
      }

      const processedData = processMachineData(nodes);
      updateMachineData(processedData);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
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

    if (autoScroll && totalPages > 1 && scrollInterval > 0) {
      timer = setInterval(() => {
        setCurrentPage((current) => {
          if (current >= totalPages) return 1;
          return current + 1;
        });
      }, scrollInterval * 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoScroll, scrollInterval, totalPages]);

  const getStatusColor = useCallback(
    (status: ErrorCode | "running" | "stopped" | "off") => {
      return statusColors[status] || "#a855f7";
    },
    []
  );

  const getCurrentPageMachines = useCallback(() => {
    const startIndex = (currentPage - 1) * machinesPerPage;
    const endIndex = startIndex + machinesPerPage;
    const pageMachines = machinesData.slice(startIndex, endIndex);

    console.log(
      `Trang ${currentPage}:`,
      pageMachines.map((m) => m.id)
    );

    return pageMachines;
  }, [currentPage, machinesData]);

  const StatusLegend = React.memo(() => {
    const errorItems = [
      { label: "Đứt sợi trên", color: "#ef4444" },
      { label: "Đứt sợi dưới", color: "#ef4444" },
      { label: "Đứt lõi cách điện", color: "#93c5fd" },
      { label: "Đứt băng nhôm", color: "#f97316" },
      { label: "Lỗi khác", color: "#a855f7" },
    ];

    const statusItems = [
      { label: "Máy chạy", color: "#22c55e" },
      { label: "Máy dừng", color: "#1d4ed8" },
      { label: "Máy tắt", color: "#6b7280" },
      { label: "Thời gian còn lại", color: "#ffffff" },
    ];

    const LegendItem = ({
      item,
    }: {
      item: { label: string; color: string };
    }) => (
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-xl whitespace-nowrap">{item.label}</span>
      </div>
    );

    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-5 gap-x-8">
          {errorItems.map((item, index) => (
            <LegendItem key={`error-${index}`} item={item} />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-x-8">
          {statusItems.map((item, index) => (
            <LegendItem key={`status-${index}`} item={item} />
          ))}
        </div>
      </div>
    );
  });
  StatusLegend.displayName = "StatusLegend";

  const MachineCard = React.memo(
    ({ machine }: { machine: ProcessedMachineData }) => {
      const chartRef = useRef<HTMLDivElement>(null);
      const chartInstance = useRef<echarts.ECharts | null>(null);

      useEffect(() => {
        if (chartRef.current && machine.history.length > 0) {
          if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
          }

          const now = new Date();
          const baseDate = new Date(now);
          baseDate.setHours(6, 0, 0, 0);
          if (now.getHours() < 6) {
            baseDate.setDate(baseDate.getDate() - 1);
          }
          const startTime = baseDate.getTime();
          const endTime = startTime + 24 * 60 * 60 * 1000;
          const currentTime = Math.min(now.getTime(), endTime);

          console.log(`Khoảng thời gian biểu đồ tròn máy ${machine.id}:`, {
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            currentTime: new Date(currentTime).toISOString(),
          });

          const sortedHistory = [...machine.history]
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            )
            .filter(
              (h) =>
                new Date(h.timestamp).getTime() >= startTime &&
                new Date(h.timestamp).getTime() <= endTime
            );

          console.log(`History được lọc máy ${machine.id}:`, sortedHistory);

          const timelineData: {
            status: string;
            statusText: string;
            duration: number;
          }[] = [];
          let lastEndTime = startTime;

          if (sortedHistory.length === 0) {
            const offDuration = (endTime - startTime) / (1000 * 60 * 60);
            if (offDuration > 0) {
              timelineData.push({
                status: "off",
                statusText: "Máy tắt",
                duration: offDuration,
              });
            }
          } else {
            sortedHistory.forEach((record, index) => {
              const start = Math.max(
                new Date(record.timestamp).getTime(),
                startTime
              );
              if (start > endTime) return;

              const nextRecordTime =
                index < sortedHistory.length - 1
                  ? new Date(sortedHistory[index + 1].timestamp).getTime()
                  : currentTime;
              const end = Math.min(nextRecordTime, endTime);
              const duration = (end - start) / (1000 * 60 * 60);

              if (start > lastEndTime) {
                const offDuration = (start - lastEndTime) / (1000 * 60 * 60);
                if (offDuration > 0) {
                  timelineData.push({
                    status: "off",
                    statusText: "Máy tắt",
                    duration: offDuration,
                  });
                }
              }

              const status =
                record.ma_loi || (record.status ? "running" : "stopped");
              const statusText = record.ma_loi
                ? errorCodes[record.ma_loi].message
                : record.status
                ? "Đang chạy"
                : "Đang dừng";

              if (duration > 0) {
                timelineData.push({
                  status,
                  statusText,
                  duration,
                });
              }

              lastEndTime = end;
            });
          }

          if (lastEndTime < endTime) {
            const remainingDuration =
              (endTime - lastEndTime) / (1000 * 60 * 60);
            if (remainingDuration > 0) {
              timelineData.push({
                status: "off",
                statusText: "Thời gian còn lại",
                duration: remainingDuration,
              });
            }
          }

          const pieData = timelineData.reduce(
            (acc, curr) => {
              const existing = acc.find(
                (item) => item.name === curr.statusText
              );
              if (existing) {
                existing.value += curr.duration;
              } else {
                acc.push({
                  value: curr.duration,
                  name: curr.statusText,
                  itemStyle: { color: statusColors[curr.status] },
                  label: {
                    show: false,
                    formatter: `{b|${curr.statusText.toUpperCase()}}\n{d|${curr.duration.toFixed(
                      1
                    )}h}`,
                    rich: {
                      b: { fontWeight: "bold", fontSize: 10, color: "#fff" },
                      d: { fontSize: 8, color: "#ddd" },
                    },
                  },
                });
              }
              return acc;
            },
            [] as Array<{
              value: number;
              name: string;
              itemStyle: { color: string };
              label: any;
            }>
          );

          console.log(`Biểu đồ tròn máy ${machine.id}:`, {
            timelineData,
            pieData: pieData.map((item) => ({
              name: item.name,
              duration: item.value.toFixed(2) + "h",
              color: item.itemStyle.color,
            })),
          });

          const option = {
            tooltip: {
              trigger: "item",
              formatter: (params: any) => {
                const data = pieData[params.dataIndex];
                return `
                <div><strong>${machine.id}</strong></div>
                <div>Trạng thái: ${data.name}</div>
                <div>Thời gian: ${data.value.toFixed(2)} giờ</div>
                <div>Tỷ lệ: ${params.percent.toFixed(1)}%</div>
              `;
              },
            },
            series: [
              {
                type: "pie",
                radius: ["40%", "70%"],
                avoidLabelOverlap: false,
                label: { show: false },
                labelLine: { show: false },
                data: pieData,
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                  },
                },
              },
            ],
            graphic: {
              type: "text",
              left: "center",
              top: "center",
              style: {
                text: `${machine.efficiency.toFixed(1)}%`,
                textAlign: "center",
                fill: "#fff",
                fontSize: 20,
                fontWeight: "bold",
              },
            },
          };

          chartInstance.current.setOption(option, true);
        }
      }, [machine.history, machine.efficiency]);

      useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
          if (chartInstance.current) {
            chartInstance.current.resize();
          }
        });
        if (chartRef.current) {
          resizeObserver.observe(chartRef.current);
        }
        return () => {
          resizeObserver.disconnect();
          if (chartInstance.current) {
            chartInstance.current.dispose();
            chartInstance.current = null;
          }
        };
      }, []);

      return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gradient-to-br hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-700 hover:border-teal-500">
          <h2 className="text-center text-2xl font-bold">{machine.id}</h2>
          <div className="w-48 h-48 mx-auto relative">
            <div ref={chartRef} className="w-full h-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xl w-full">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-400 ml-2">
                Số mét đặt
              </span>
              <span className="ml-2">
                {machine.targetMeters.toLocaleString()} M
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-400 mr-2 text-right">
                Số mét thực
              </span>
              <span className="mr-2 text-right">
                {machine.actualMeters.toLocaleString()} M
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-400 ml-2">
                Tốc độ đặt
              </span>
              <span className="ml-2">{machine.targetRpm} Rpm</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-400 text-right mr-2">
                Tốc độ thực
              </span>
              <span className="mr-2 text-right">{machine.actualRpm} Rpm</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between">
            <span className="font-semibold ml-2 text-xl">Trạng thái:</span>
            <span
              className="text-right text-lg"
              style={{ color: getStatusColor(machine.status) }}
            >
              {machine.errorMessage ||
                (machine.status === "running"
                  ? "Đang chạy"
                  : machine.status === "stopped"
                  ? "Đang dừng"
                  : "Máy tắt")}
            </span>
          </div>
        </div>
      );
    }
  );
  MachineCard.displayName = "MachineCard";

  const Pagination = React.memo(() => {
    const [pageInput, setPageInput] = useState(currentPage.toString());

    const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) {
        setPageInput(value);
      }
    };

    const handlePageSubmit = () => {
      const newPage = Number(pageInput);
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      } else {
        setPageInput(currentPage.toString());
      }
    };

    useEffect(() => {
      setPageInput(currentPage.toString());
    }, [currentPage]);

    return (
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Tự động chuyển</span>
          </label>

          <div className="flex items-center gap-2">
            <span>Thời gian:</span>
            <input
              type="number"
              min="1"
              max="60"
              value={scrollInterval}
              onChange={(e) => setScrollInterval(Number(e.target.value))}
              className="w-16 p-1 text-center bg-gray-800 text-white border rounded"
            />
            <span>giây</span>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-gray-700 pl-8">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-gray-700 rounded disabled:opacity-50"
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
            <span>Trang</span>
            <input
              type="text"
              value={pageInput}
              onChange={handlePageChange}
              onBlur={handlePageSubmit}
              onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
              className="w-12 p-1 text-center bg-gray-800 text-white border rounded"
            />
            <span>/{totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-700 rounded disabled:opacity-50"
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
  });
  Pagination.displayName = "Pagination";

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="p-2 text-white">
        <h1 className="text-4xl mb-4 font-bold text-center bg-gradient-to-r from-teal-400 to-indigo-500 text-transparent bg-clip-text">
          DASHBOARD - TRẠNG THÁI MÁY
        </h1>

        {machinesData.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {getCurrentPageMachines().map((machine) => (
                <MachineCard key={machine.id} machine={machine} />
              ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-gray-700">
              <StatusLegend />
              <Pagination />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl">Đang tải dữ liệu máy...</p>
          </div>
        )}
      </div>
    </main>
  );
}

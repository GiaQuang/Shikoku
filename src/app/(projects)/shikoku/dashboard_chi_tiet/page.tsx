"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useInterval } from "usehooks-ts";
import * as echarts from "echarts";
import { api_get_error_machines } from "../api";

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
  | "e13"
  | "e14";

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
  e14: { message: "Đạt chiều dài", color: "#a855f7" },
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

  const processMachineData = useCallback(
    (machines: MachineData[]): ProcessedMachineData[] => {
      return machines.map((machine) => {
        const latestStatus = machine.history[machine.history.length - 1] || {};
        const status =
          latestStatus.ma_loi || (latestStatus.status ? "running" : "stopped");

        return {
          id: `MÁY ${String(machine.id + 1).padStart(2, "0")}`,
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
      if (prevData.length === 0) return newData; // Khởi tạo lần đầu

      const updatedData = [...prevData];
      let hasChanges = false;

      newData.forEach((newMachine) => {
        const index = updatedData.findIndex((m) => m.id === newMachine.id);
        if (index !== -1) {
          const prevHistory = updatedData[index].history;
          const newHistory = newMachine.history;
          const hasHistoryChanged =
            JSON.stringify(prevHistory) !== JSON.stringify(newHistory);

          if (hasHistoryChanged) {
            updatedData[index] = newMachine;
            hasChanges = true;
          }
        } else {
          updatedData.push(newMachine);
          hasChanges = true;
        }
      });

      return hasChanges ? updatedData : prevData; // Chỉ cập nhật nếu có thay đổi
    });
  }, []);

  const fetchMachineData = useCallback(async () => {
    try {
      const res = await api_get_error_machines();
      if (!res) {
        console.log("Lỗi khi lấy dữ liệu lỗi máy!");
        return;
      }

      const data = res instanceof Response ? await res.json() : res;
      console.log("Dữ liệu lỗi máy:", data);

      if (data?.machines) {
        const processedData = processMachineData(data.machines);
        updateMachineData(processedData);
      }
    } catch (error) {
      console.log("Lỗi khi lấy dữ liệu lỗi máy!", error);
    }
  }, [processMachineData, updateMachineData]);

  useInterval(() => {
    fetchMachineData();
  }, 1000); // Gọi API mỗi 1 giây

  useEffect(() => {
    fetchMachineData(); // Gọi lần đầu khi mount
  }, [fetchMachineData]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (autoScroll && machinesData.length > 0) {
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
  }, [autoScroll, scrollInterval, totalPages, machinesData]);

  const getStatusColor = useCallback(
    (status: ErrorCode | "running" | "stopped" | "off") => {
      return statusColors[status] || "#a855f7";
    },
    []
  );

  const getCurrentPageMachines = useCallback(() => {
    const startIndex = (currentPage - 1) * machinesPerPage;
    return machinesData.slice(startIndex, startIndex + machinesPerPage);
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

          const timelineData = machine.history.map((record, index) => {
            const startTime = new Date(record.timestamp);
            const endTime =
              index < machine.history.length - 1
                ? new Date(machine.history[index + 1].timestamp)
                : new Date();

            const duration =
              (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

            return {
              start: startTime,
              end: endTime,
              duration,
              status: record.ma_loi || (record.status ? "running" : "stopped"),
              statusText: record.ma_loi
                ? errorCodes[record.ma_loi]?.message
                : record.status
                ? "Đang chạy"
                : "Đang dừng",
            };
          });
          MachineCard.displayName = "MachineCard";

          const pieData = timelineData.map((item, index) => ({
            value: item.duration,
            name: item.statusText,
            itemStyle: { color: statusColors[item.status] },
            label: {
              show: index === timelineData.length - 1,
              formatter: `{b|${item.statusText.toUpperCase()}}\n{d|${item.duration.toFixed(
                1
              )}h}`,
              rich: {
                b: { fontWeight: "bold", fontSize: 10, color: "#fff" },
                d: { fontSize: 8, color: "#ddd" },
              },
            },
          }));

          const option = {
            tooltip: {
              trigger: "item",
              formatter: (params: any) => {
                const data = timelineData[params.dataIndex];
                return `
                <div><strong>${machine.id}</strong></div>
                <div>Trạng thái: ${data.statusText}</div>
                <div>Thời gian: ${data.start.toLocaleTimeString()} - ${data.end.toLocaleTimeString()}</div>
                <div>Kéo dài: ${data.duration.toFixed(2)} giờ</div>
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

          chartInstance.current.setOption(option, true); // true để merge options thay vì replace
        }
      }, [machine.history, machine.efficiency]);

      useEffect(() => {
        return () => {
          if (chartInstance.current) {
            chartInstance.current.dispose();
          }
        };
      }, []);

      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
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
        <h1 className="text-2xl mb-4 text-center">
          Dashboard - Trạng thái máy
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

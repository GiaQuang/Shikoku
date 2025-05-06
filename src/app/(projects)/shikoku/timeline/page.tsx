"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
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

const statusColors: Record<string, string> = {
  running: "#008000", // Máy chạy
  stopped: "#00BFFF", // Máy dừng
  off: "#808080", // Máy tắt
};

const errorCodes: Record<string, { message: string; color: string }> = {
  e01: { message: "Đứt sợi trên", color: "#FF0000" },
  e02: { message: "Đứt sợi dưới", color: "#FFA500" },
  e03: { message: "Đứt lõi cách điện", color: "#00BFFF" },
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
  e14: { message: "Đạt chiều dài", color: "#800080" },
};

const MachineChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollInterval, setScrollInterval] = useState(5);
  const [machinesData, setMachinesData] = useState<MachineData[]>([]);

  const machinesPerPage = 10;
  const totalMachines = 200;
  const totalPages = Math.ceil(totalMachines / machinesPerPage);

  const fetchMachineData = useCallback(async () => {
    try {
      const res = await api_get_error_machines();
      const data = res instanceof Response ? await res.json() : res;
      console.log("Lấy dữ liệu từ API:", data);

      if (data?.machines) {
        setMachinesData((prevData) => {
          const newData = data.machines as MachineData[];
          const hasChanges = newData.some((newMachine) => {
            const prevMachine = prevData.find((m) => m.id === newMachine.id);
            if (!prevMachine) return true;
            return (
              JSON.stringify(prevMachine.history) !==
              JSON.stringify(newMachine.history)
            );
          });
          return hasChanges ? newData : prevData;
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu từ API:", error);
    }
  }, []);

  useInterval(() => {
    fetchMachineData();
  }, 1000);

  useEffect(() => {
    fetchMachineData(); // Gọi lần đầu khi mount
  }, [fetchMachineData]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoScroll) {
      timer = setInterval(() => {
        setCurrentPage((current) => (current >= totalPages ? 1 : current + 1));
      }, scrollInterval * 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoScroll, scrollInterval, totalPages]);

  useEffect(() => {
    if (chartRef.current && machinesData.length > 0) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const baseDate = new Date();
      baseDate.setHours(6, 0, 0, 0);
      const startTime = baseDate.getTime();
      const endTime = startTime + 24 * 3600000; // 6:00 ngày mai
      const currentTime = new Date().getTime(); // Thời gian thực (ví dụ: 14:38)

      const startIndex = (currentPage - 1) * machinesPerPage;
      const categories = machinesData
        .slice(startIndex, startIndex + machinesPerPage)
        .map((machine) => `MÁY ${String(machine.id + 1).padStart(2, "0")}`);

      const data = machinesData
        .slice(startIndex, startIndex + machinesPerPage)
        .flatMap((machine, catIndex) => {
          const timelineData = [];
          let lastEndTime = startTime;

          // Sắp xếp history theo thời gian
          const sortedHistory = [...machine.history].sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          sortedHistory.forEach((record, index) => {
            const start = new Date(record.timestamp).getTime();
            if (start > currentTime) return; // Bỏ qua các trạng thái sau thời gian thực

            const nextRecordTime =
              index < sortedHistory.length - 1
                ? new Date(sortedHistory[index + 1].timestamp).getTime()
                : endTime;
            const end = Math.min(nextRecordTime, currentTime); // Giới hạn đến thời gian thực
            const duration = end - start;

            if (start > lastEndTime) {
              // Thêm khoảng "Máy tắt" nếu có gap trước thời gian thực
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

            timelineData.push({
              name: status,
              value: [catIndex, start, end, duration],
              itemStyle: { normal: { color } },
            });

            lastEndTime = end;
          });

          // Không thêm "Máy tắt" sau thời gian thực
          return timelineData;
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
            return `${params.marker}${params.name}<br/>Bắt đầu: ${pad(
              date.getHours()
            )}:${pad(date.getMinutes())}<br/>Kết thúc: ${pad(
              endDate.getHours()
            )}:${pad(endDate.getMinutes())}<br/>Thời gian: ${(
              params.value[3] / 60000
            ).toFixed(1)} phút`;
          },
        },
        title: {
          text: "THỐNG KÊ TRẠNG THÁI VÀ LỖI MÁY (06:00 - 06:00)",
          left: "center",
          top: 15,
          textStyle: { fontSize: 25, fontWeight: "bold", color: "#ffffff" },
        },
        dataZoom: [
          {
            type: "slider",
            filterMode: "weakFilter",
            showDataShadow: false,
            bottom: 20,
            left: "10%",
            right: "10%",
            height: 10,
            labelFormatter: "",
            backgroundColor: "#374151",
            fillerColor: "#60A5FA",
          },
          { type: "inside", filterMode: "weakFilter" },
        ],
        grid: { height: 750, left: 100, right: 30, top: 70, bottom: 100 },
        xAxis: {
          type: "time",
          min: startTime,
          max: endTime, // 6:00 ngày mai
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
      };
    }
  }, [currentPage, machinesData]);

  const StatusLegendComponent = () => {
    const errorItems = [
      { label: "Đứt sợi trên", color: "#FF0000" },
      { label: "Đứt sợi dưới", color: "#FFA500" },
      { label: "Đứt lõi cách điện", color: "#00BFFF" },
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

    const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) setInput(value);
    };

    const handlePageSubmit = () => {
      const newPage = parseInt(input);
      if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      } else {
        setInput(currentPage.toString());
      }
    };

    useEffect(() => {
      setInput(currentPage.toString());
    }, [currentPage]);

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
              type="number"
              min="1"
              max="60"
              value={scrollInterval}
              onChange={(e) => setScrollInterval(Number(e.target.value))}
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
              type="text"
              value={input}
              onChange={handlePageChange}
              onBlur={handlePageSubmit}
              onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
              className="w-12 p-2 text-center bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="w-full h-[900px] bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div ref={chartRef} className="w-full h-full" />
      </div>
      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <StatusLegend />
        <Pagination />
      </div>
    </div>
  );
};

export default MachineChart;

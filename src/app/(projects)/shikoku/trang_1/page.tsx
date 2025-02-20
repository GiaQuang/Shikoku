// app/page.tsx
"use client";
import React from "react";

import { useState, useEffect } from "react";
import * as echarts from "echarts";

type ErrorCode =
  | "E01"
  | "E02"
  | "E03"
  | "E04"
  | "E05"
  | "E06"
  | "E07"
  | "E08"
  | "E09"
  | "E10"
  | "E11"
  | "E12"
  | "E13"
  | "E14";

type MachineData = {
  id: string;
  efficiency: number;
  targetMeters: number;
  actualMeters: number;
  targetRpm: number;
  actualRpm: number;
  status: ErrorCode;
  errorMessage?: string;
};

const errorCodes: Record<string, { message: string; color: string }> = {
  E01: { message: "Đứt sợi trên", color: "#ef4444" },
  E02: { message: "Đứt sợi dưới", color: "#ef4444" },
  E03: { message: "Đứt lõi cách điện", color: "#93c5fd" },
  E04: { message: "Đứt băng nhôm", color: "#f97316" },
  E05: { message: "Bơm dầu không lên", color: "#a855f7" },
  E06: { message: "Mức dầu thấp", color: "#a855f7" },
  E07: { message: "Quá tải bơm dầu", color: "#a855f7" },
  E08: { message: "Lỗi biến tần", color: "#a855f7" },
  E09: { message: "Truyền thông biến tần", color: "#a855f7" },
  E10: { message: "Lỗi trục cuốn", color: "#a855f7" },
  E11: { message: "Báo động maoci", color: "#a855f7" },
  E12: { message: "Cửa mở", color: "#a855f7" },
  E13: { message: "Đang dừng khẩn cấp", color: "#a855f7" },
  E14: { message: "Đạt chiều dài", color: "#a855f7" },
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollInterval, setScrollInterval] = useState(5);
  const machinesPerPage = 10;
  const totalMachines = 200;
  const totalPages = Math.ceil(totalMachines / machinesPerPage);

  // Xử lý tự động chuyển trang
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (autoScroll) {
      timer = setInterval(() => {
        setCurrentPage((current) => {
          if (current >= totalPages) {
            return 1;
          }
          return current + 1;
        });
      }, scrollInterval * 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [autoScroll, scrollInterval, totalPages]);

  const generateMachineData = (id: number): MachineData => {
    const statuses = Object.keys(errorCodes) as ErrorCode[];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      id: `MÁY ${String(id).padStart(2, "0")}`,
      efficiency: Math.floor(Math.random() * 100),
      targetMeters: 2000,
      actualMeters: Math.floor(1800 + Math.random() * 200),
      targetRpm: 1500,
      actualRpm: 1500,
      status,
      errorMessage: errorCodes[status].message,
    };
  };

  const getCurrentPageMachines = () => {
    const machines = [];
    const startIndex = (currentPage - 1) * machinesPerPage;
    for (let i = 0; i < machinesPerPage; i++) {
      machines.push(generateMachineData(startIndex + i + 1));
    }
    return machines;
  };

  const getStatusColor = (status: ErrorCode) => {
    return errorCodes[status]?.color || "#22c55e";
  };

  const StatusLegend = () => {
    const errorItems = [
      { label: "Đứt sợi trên", color: "#ef4444" },
      { label: "Đứt sợi dưới", color: "#ef4444" },
      { label: "Đứt lõi cách điện", color: "#93c5fd" },
      { label: "Đứt băng nhôm", color: "#f97316" },
      { label: "Lỗi khác", color: "#a855f7" },
    ];

    const statusItems = [
      { label: "Máy dừng", color: "#1d4ed8" },
      { label: "Máy chạy", color: "#22c55e" },
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
  };

  const MachineCard = ({ machine }: { machine: MachineData }) => {
    const chartRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (chartRef.current) {
        const chart = echarts.init(chartRef.current);

        const option = {
          tooltip: {
            trigger: "item",
            formatter: "{b}: {c} ({d}%)", // Hiển thị tên, giá trị và phần trăm khi hover
          },
          legend: {
            show: false, // Ẩn chú thích
          },
          series: [
            {
              name: "Hiệu suất",
              type: "pie",
              radius: ["40%", "70%"],
              avoidLabelOverlap: false,
              label: {
                show: false, // Ẩn nhãn trên từng phần
              },
              labelLine: {
                show: false,
              },
              data: [
                {
                  value: machine.efficiency,
                  name: "Hiệu suất",
                  itemStyle: { color: getStatusColor(machine.status) },
                },
                {
                  value: 100 - machine.efficiency,
                  name: "Còn lại",
                  itemStyle: { color: "#374151" }, // Màu xám đậm
                },
              ],
            },
          ],
          graphic: {
            type: "text",
            left: "center",
            top: "center",
            style: {
              text: `${machine.efficiency}%`, // Hiển thị hiệu suất ở giữa
              textAlign: "center",
              fill: "#fff", // Màu chữ trắng
              fontSize: 20,
              fontWeight: "bold",
            },
          },
        };

        chart.setOption(option);

        // Resize chart khi kích thước cửa sổ thay đổi
        window.addEventListener("resize", () => {
          chart.resize();
        });

        return () => {
          chart.dispose();
          window.removeEventListener("resize", () => {
            chart.resize();
          });
        };
      }
    }, [machine]);

    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-center text-2xl font-bold">{machine.id}</h2>

        <div className="w-48 h-48 mx-auto relative">
          <div ref={chartRef} className="w-full h-full"></div>
        </div>

        <div className="space-y-1 text-xl">
          <div className="flex justify-between">
            <span>Số mét đặt:</span>
            <span>{machine.targetMeters} M</span>
          </div>
          <div className="flex justify-between">
            <span>Số mét thực:</span>
            <span>{machine.actualMeters} M</span>
          </div>
          <div className="flex justify-between">
            <span>Tốc độ đặt:</span>
            <span>{machine.targetRpm} Rpm</span>
          </div>
          <div className="flex justify-between">
            <span>Tốc độ thực:</span>
            <span>{machine.actualRpm} Rpm</span>
          </div>
          <div className="flex justify-between">
            <span>Mã lỗi:</span>
            <span
              className="text-center mb-3 text-lg"
              style={{ color: getStatusColor(machine.status) }}
            >
              {`${machine.status} - ${machine.errorMessage}`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const Pagination = () => {
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
            <span>Tự động chuyển trang</span>
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
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="p-2 text-white">
        <h1 className="text-2xl mb-4 text-center">
          Dashboard - Trạng thái máy
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {getCurrentPageMachines().map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-gray-700">
          <StatusLegend />
          <Pagination />
        </div>
      </div>
    </main>
  );
}

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
  const machinesPerPage = 25;
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
    const targetMeters = 2000;
    const actualMeters = Math.floor(Math.random() * targetMeters);

    return {
      id: `MÁY ${String(id).padStart(2, "0")}`,
      targetMeters,
      actualMeters,
      targetRpm: 1500,
      actualRpm: Math.floor(1200 + Math.random() * 300),
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

  const calculateEfficiency = (actual: number, target: number) => {
    return Math.round((actual / target) * 100);
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
    ];

    const LegendItem = ({
      item,
    }: {
      item: { label: string; color: string };
    }) => (
      <div className="flex items-center gap-3 bg-gray-800 px-3 py-2 rounded-full">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-sm font-medium whitespace-nowrap">
          {item.label}
        </span>
      </div>
    );

    return (
      <div className="flex flex-col gap-3 bg-gray-900 p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {errorItems.map((item, index) => (
            <LegendItem key={`error-${index}`} item={item} />
          ))}
        </div>
        {/* <div className="h-px bg-gray-700 w-full my-1"></div> */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {statusItems.map((item, index) => (
            <LegendItem key={`status-${index}`} item={item} />
          ))}
        </div>
      </div>
    );
  };

  const MachineCard = ({ machine }: { machine: MachineData }) => {
    const efficiency = calculateEfficiency(
      machine.actualMeters,
      machine.targetMeters
    );

    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-4 rounded-xl shadow-lg border border-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            {machine.id}
          </h2>
          <div className="bg-gray-800 rounded-full px-3 py-1">
            <span className="font-bold text-lg text-white">{efficiency}%</span>
          </div>
        </div>

        {/* Progress bar with improved styling */}
        <div className="w-full bg-gray-800 rounded-lg h-6 relative overflow-hidden mb-3 shadow-inner">
          <div
            className="h-full rounded-lg transition-all duration-500 flex items-center"
            style={{
              width: `${efficiency}%`,
              background:
                efficiency > 90
                  ? "linear-gradient(90deg, #10b981, #059669)"
                  : efficiency > 70
                  ? "linear-gradient(90deg, #f59e0b, #d97706)"
                  : "linear-gradient(90deg, #ef4444, #b91c1c)",
              minWidth: "40px",
            }}
          >
            <div className="w-full h-full opacity-30 bg-[radial-gradient(at_right_top,_white,_transparent)] absolute"></div>
          </div>

          {/* Meter information with improved layout */}
          <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">
                Thực tế:
              </span>
              <span className="font-bold text-sm text-white">
                {machine.actualMeters}M
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">Đặt:</span>
              <span className="font-bold text-sm text-white">
                {machine.targetMeters}M
              </span>
            </div>
          </div>
        </div>

        {/* Status section with improved visual style */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-800">
          <span className="font-medium text-sm text-gray-400">Trạng thái:</span>
          <div
            className="text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            style={{
              backgroundColor: getStatusColor(machine.status),
              opacity: 0.95,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <span className="text-white">
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
      <div className="flex items-center gap-8 bg-gray-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span>Tự động chuyển trang</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-sm">Thời gian:</span>
            <input
              type="number"
              min="1"
              max="60"
              value={scrollInterval}
              onChange={(e) => setScrollInterval(Number(e.target.value))}
              className="w-16 p-1 text-center bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm">giây</span>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-gray-700 pl-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 transition-colors"
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
            <span className="text-sm">Trang</span>
            <input
              type="text"
              value={pageInput}
              onChange={handlePageChange}
              onBlur={handlePageSubmit}
              onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
              className="w-12 p-1 text-center bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm">/ {totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 transition-colors"
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
      <div className="p-4 text-white">
        <h1 className="text-2xl mb-4 text-center">
          Dashboard - Trạng thái máy
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-0">
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

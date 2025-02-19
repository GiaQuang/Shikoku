// app/page.tsx
"use client";
import { useState } from "react";

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
  | "E13";
//   | "running"
//   | "machine_off"
//   | "time_remaining";

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
  //   machine_off: { message: "Máy tắt", color: "#6b7280" },
  //   time_remaining: { message: "Thời gian còn lại", color: "#ffffff" },
  //   running: { message: "Đang chạy", color: "#22c55e" },
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const machinesPerPage = 10;
  const totalMachines = 200;
  const totalPages = Math.ceil(totalMachines / machinesPerPage);

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
    return (
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-center text-2xl font-bold">{machine.id}</h2>

        <div className="relative w-48 h-48 mx-auto ">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="100"
              cy="95"
              r="72"
              className="stroke-current text-gray-700"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="100"
              cy="95"
              r="72"
              strokeWidth="12"
              fill="none"
              strokeDasharray="452.39"
              strokeDashoffset={452.39 * (1 - machine.efficiency / 100)}
              style={{ stroke: getStatusColor(machine.status) }}
            />
          </svg>
          {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
            {machine.efficiency}%
          </div> */}
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
            {machine.efficiency}%
          </div>
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
      // Kiểm tra giá trị nhập vào có phải là số và trong phạm vi hợp lệ
      if (/^\d*$/.test(value)) {
        setPageInput(value);
      }
    };

    const handlePageSubmit = () => {
      const newPage = Number(pageInput);
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      } else {
        setPageInput(currentPage.toString()); // Reset nếu số trang không hợp lệ
      }
    };

    return (
      <div className="flex items-center gap-4">
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

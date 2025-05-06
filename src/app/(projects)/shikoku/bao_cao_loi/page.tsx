"use client";
import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";

// Định nghĩa các mã lỗi với thông tin và màu sắc
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

const borderColors = [
  "border-red-500",
  "border-blue-500",
  "border-yellow-500",
  "border-purple-500",
];

// Component chính
const MachineErrorReport = () => {
  // State quản lý
  const [fromDate, setFromDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [fromMachine, setFromMachine] = useState<string>("M001");
  const [toMachine, setToMachine] = useState<string>("M005");
  const [selectedErrorCode, setSelectedErrorCode] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [tableData, setTableData] = useState([
    {
      id: 1,
      machineId: "M001",
      machineName: "Máy 1",
      errorCode: "E01",
      errorTime: "2023-10-01 14:30",
      totalErrorTime: "02:10:05",
    },
    {
      id: 2,
      machineId: "M002",
      machineName: "Máy 2",
      errorCode: "E03",
      errorTime: "2023-10-02 10:15",
      totalErrorTime: "03:20:15",
    },
    {
      id: 3,
      machineId: "M003",
      machineName: "Máy 3",
      errorCode: "E08",
      errorTime: "2023-10-03 09:00",
      totalErrorTime: "05:30:25",
    },
    {
      id: 4,
      machineId: "M004",
      machineName: "Máy 4",
      errorCode: "E02",
      errorTime: "2023-10-05 13:45",
      totalErrorTime: "01:45:30",
    },
    {
      id: 5,
      machineId: "M005",
      machineName: "Máy 5",
      errorCode: "E06",
      errorTime: "2023-10-07 08:30",
      totalErrorTime: "02:00:45",
    },
    {
      id: 6,
      machineId: "M006",
      machineName: "Máy 6",
      errorCode: "E06",
      errorTime: "2023-10-07 08:30",
      totalErrorTime: "03:15:00",
    },
    {
      id: 7,
      machineId: "M001",
      machineName: "Máy 1",
      errorCode: "E05",
      errorTime: "2023-10-08 09:00",
      totalErrorTime: "04:01:20",
    },
    {
      id: 8,
      machineId: "M001",
      machineName: "Máy 1",
      errorCode: "E05",
      errorTime: "2023-10-08 09:00",
      totalErrorTime: "04:01:20",
    },
    {
      id: 9,
      machineId: "M001",
      machineName: "Máy 1",
      errorCode: "E05",
      errorTime: "2023-10-08 09:00",
      totalErrorTime: "04:01:20",
    },
    {
      id: 10,
      machineId: "M001",
      machineName: "Máy 1",
      errorCode: "E05",
      errorTime: "2023-10-08 09:00",
      totalErrorTime: "04:01:20",
    },
  ]);

  // Xử lý khi người dùng thực hiện tìm kiếm
  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      const filteredTableData = tableData.filter(
        (row) =>
          (selectedErrorCode === "all" ||
            row.errorCode === selectedErrorCode) &&
          row.machineId >= fromMachine &&
          row.machineId <= toMachine &&
          new Date(row.errorTime) >= new Date(fromDate) &&
          new Date(row.errorTime) <= new Date(toDate)
      );
      setTableData(filteredTableData);
      setIsLoading(false);
    }, 800);
  };

  // Xuất báo cáo
  const exportReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Báo cáo đã được xuất thành công (${fromDate} đến ${toDate})`);
    }, 1000);
  };

  // Tính toán số liệu thống kê với useMemo
  const statistics = useMemo(
    () => ({
      totalMachinesWithErrors: tableData.reduce((acc, curr) => {
        if (!acc.includes(curr.machineId)) acc.push(curr.machineId);
        return acc;
      }, [] as string[]).length,
      totalErrors: tableData.length,
      mostCommonError: (() => {
        const counts: Record<string, number> = {};
        tableData.forEach((row) => {
          counts[row.errorCode] = (counts[row.errorCode] || 0) + 1;
        });
        const mostCommon = Object.entries(counts).sort(
          (a, b) => b[1] - a[1]
        )[0];
        return mostCommon ? mostCommon[0] : "N/A";
      })(),
      totalErrorTime: (() => {
        let total = 0;
        tableData.forEach((row) => {
          const [hours, minutes, seconds] = row.totalErrorTime
            .split(":")
            .map(Number);
          total += hours * 3600 + minutes * 60 + seconds;
        });
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      })(),
    }),
    [tableData]
  );

  // Danh sách máy
  const machines = ["M001", "M002", "M003", "M004", "M005", "M006"];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Đang xử lý...</p>
          </div>
        </div>
      )}

      {/* Header */}
      {/* <div className="bg-gray-800 border-b border-gray-700 shadow-md">
        <div className="max-w-8xl mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">Quản Lý Lỗi Máy</h1>
                <p className="text-sm text-gray-400">
                  Phân tích và quản lý lỗi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="max-w-8xl mx-auto px-6 py-6">
        {/* Bộ lọc */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-4 border border-gray-700">
          <div className="mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              BÁO CÁO LỖI
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xl text-gray-400 mb-1">Từ máy</label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
                value={fromMachine}
                onChange={(e) => setFromMachine(e.target.value)}
              >
                {machines.map((machine) => (
                  <option key={`from-${machine}`} value={machine}>
                    {machine}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xl text-gray-400 mb-1">
                Đến máy
              </label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
                value={toMachine}
                onChange={(e) => setToMachine(e.target.value)}
              >
                {machines.map((machine) => (
                  <option key={`to-${machine}`} value={machine}>
                    {machine}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xl text-gray-400 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xl text-gray-400 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xl text-gray-400 mb-1">Mã lỗi</label>
              <select
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl"
                value={selectedErrorCode}
                onChange={(e) => setSelectedErrorCode(e.target.value)}
              >
                <option value="all">Tất cả lỗi</option>
                {Object.entries(errorCodes).map(([code, info]) => (
                  <option key={code} value={code}>
                    {code} - {info.message}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              onClick={() => {
                setFromDate(
                  (() => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - 1);
                    return date.toISOString().split("T")[0];
                  })()
                );
                setToDate(new Date().toISOString().split("T")[0]);
                setFromMachine("M001");
                setToMachine("M005");
                setSelectedErrorCode("all");
              }}
            >
              Đặt lại
            </button>
            <button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 transition-colors"
              onClick={handleSearch}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Thẻ thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              name: (
                <span className="text-xl font-bold">Tổng số máy bị lỗi</span>
              ),
              value: statistics.totalMachinesWithErrors,
              color: "#ff4560",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              ),
            },
            {
              name: (
                <span className="text-xl font-bold">Tổng số lỗi tìm được</span>
              ),
              value: statistics.totalErrors,
              color: "#008ffb",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ),
            },
            {
              name: (
                <span className="text-xl font-bold">
                  Lỗi hay phát sinh nhất
                </span>
              ),
              value: statistics.mostCommonError,
              color: "#feb019",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              ),
            },
            {
              name: (
                <span className="text-xl font-bold">Tổng thời gian lỗi</span>
              ),
              value: statistics.totalErrorTime,
              color: "#9e44f8",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-gray-800 rounded-lg p-4 shadow-lg border-2 ${borderColors[index]} overflow-hidden hover:border-opacity-75 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.name}</p>
                  <div className="flex items-end gap-2 mt-2">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    {stat.description && (
                      <span className="text-xs text-gray-400 mb-1">
                        {stat.description}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bảng dữ liệu với cuộn */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                BÁO CÁO LỖI MÁY
              </h3>
              <button
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-700/30 transform hover:scale-105"
                onClick={exportReport}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Xuất Báo Cáo
              </button>
            </div>

            {/* Container chính với chiều cao cố định */}
            <div className="rounded-lg shadow-inner border border-gray-700 bg-gray-800/50 relative">
              {/* Bảng với tiêu đề cố định */}
              <div
                className="max-h-[550px] overflow-y-scroll"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#4B5563 #1F2937",
                }}
              >
                <table className="w-full text-left text-xl">
                  <thead className="bg-gradient-to-r from-gray-700 to-gray-800 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4 font-bold text-blue-300">STT</th>
                      <th className="py-3 px-4 font-bold text-blue-300">
                        ID MÁY
                      </th>
                      <th className="py-3 px-4 font-bold text-blue-300">
                        TÊN MÁY
                      </th>
                      <th className="py-3 px-4 font-bold text-blue-300">
                        MÃ LỖI
                      </th>
                      <th className="py-3 px-4 font-bold text-blue-300">
                        TÊN LỖI
                      </th>
                      <th className="py-3 px-4 font-bold text-blue-300">
                        THỜI ĐIỂM XẢY RA LỖI
                      </th>
                      <th className="py-3 px-4 font-bold text-blue-300">
                        TỔNG THỜI GIAN LỖI
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`${
                          index % 2 === 0 ? "bg-gray-800/80" : "bg-gray-700/60"
                        } hover:bg-gray-600/90 transition-colors duration-200`}
                      >
                        <td className="py-2 px-4 text-xl font-semibold text-gray-200">
                          {index + 1}
                        </td>
                        <td className="py-2 px-4 text-xl text-gray-300">
                          {row.machineId}
                        </td>
                        <td className="py-2 px-4 text-xl text-gray-300">
                          {row.machineName}
                        </td>
                        <td className="py-2 px-4 text-xl">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-lg font-medium shadow-md transition-all duration-300"
                            style={{
                              backgroundColor: `${
                                errorCodes[row.errorCode]?.color
                              }20`,
                              color: errorCodes[row.errorCode]?.color,
                              borderLeft: `3px solid ${
                                errorCodes[row.errorCode]?.color
                              }`,
                            }}
                          >
                            {row.errorCode}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-xl text-gray-300">
                          {errorCodes[row.errorCode]?.message ||
                            "Không xác định"}
                        </td>
                        <td className="py-2 px-4 text-xl text-gray-300">
                          {new Date(row.errorTime).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-2 px-4 text-xl font-semibold text-gray-200">
                          {row.totalErrorTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {tableData.length === 0 && (
              <div className="text-center my-12 text-gray-400 text-xl animate-pulse">
                Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineErrorReport;

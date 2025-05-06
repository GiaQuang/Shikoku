"use client";
import React, { useState, useMemo } from "react";

// Định nghĩa các mã lỗi với thông tin và màu sắc
const errorCodes = {
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

const MachineErrorReport = () => {
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromMachine, setFromMachine] = useState("M001");
  const [toMachine, setToMachine] = useState("M005");
  const [selectedErrorCode, setSelectedErrorCode] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const [tableData, setTableData] = useState([
    {
      id: 1,
      machineId: "M001",
      machineName: "Máy 1",
      date: "2023-10-01",
      downtime: "02:15:14",
      errorTime: "01:45:00",
      targetLength: "1000 m",
      totalLength: "950 m",
      efficiency: "95%",
      errorCount: 2,
    },
    {
      id: 2,
      machineId: "M002",
      machineName: "Máy 2",
      date: "2023-10-02",
      downtime: "01:00:00",
      errorTime: "00:45:30",
      targetLength: "1200 m",
      totalLength: "1100 m",
      efficiency: "91.7%",
      errorCount: 1,
    },
    {
      id: 3,
      machineId: "M003",
      machineName: "Máy 3",
      date: "2023-10-03",
      downtime: "03:04:20",
      errorTime: "02:50:00",
      targetLength: "1500 m",
      totalLength: "1400 m",
      efficiency: "93.3%",
      errorCount: 3,
    },
    {
      id: 4,
      machineId: "M004",
      machineName: "Máy 4",
      date: "2023-10-05",
      downtime: "01:00:00",
      errorTime: "02:15:30",
      targetLength: "800 m",
      totalLength: "780 m",
      efficiency: "97.5%",
      errorCount: 1,
    },
    {
      id: 5,
      machineId: "M005",
      machineName: "Máy 5",
      date: "2023-10-07",
      downtime: "01:30:00",
      errorTime: "00:45:00",
      targetLength: "2000 m",
      totalLength: "1900 m",
      efficiency: "95%",
      errorCount: 2,
    },
    {
      id: 6,
      machineId: "M006",
      machineName: "Máy 6",
      date: "2023-10-08",
      downtime: "02:00:00",
      errorTime: "01:30:00",
      targetLength: "1100 m",
      totalLength: "1050 m",
      efficiency: "95.5%",
      errorCount: 2,
    },
    {
      id: 7,
      machineId: "M007",
      machineName: "Máy 7",
      date: "2023-10-08",
      downtime: "03:00:00",
      errorTime: "02:30:00",
      targetLength: "1100 m",
      totalLength: "1050 m",
      efficiency: "95.5%",
      errorCount: 2,
    },
    {
      id: 8,
      machineId: "M008",
      machineName: "Máy 8",
      date: "2023-10-08",
      downtime: "01:30:00",
      errorTime: "01:00:00",
      targetLength: "1100 m",
      totalLength: "1050 m",
      efficiency: "95.5%",
      errorCount: 2,
    },
    {
      id: 9,
      machineId: "M009",
      machineName: "Máy 9",
      date: "2023-10-08",
      downtime: "03:10:33",
      errorTime: "02:30:00",
      targetLength: "1100 m",
      totalLength: "1050 m",
      efficiency: "95.5%",
      errorCount: 2,
    },
    {
      id: 10,
      machineId: "M010",
      machineName: "Máy 10",
      date: "2023-10-08",
      downtime: "02:00:00",
      errorTime: "01:30:00",
      targetLength: "1100 m",
      totalLength: "1050 m",
      efficiency: "95.5%",
      errorCount: 2,
    },
    {
      id: 11,
      machineId: "M011",
      machineName: "Máy 11",
      date: "2023-10-08",
      downtime: "03:00:00",
      errorTime: "04:30:00",
      targetLength: "1100 m",
      totalLength: "1050 m",
      efficiency: "95.5%",
      errorCount: 2,
    },
    {
      id: 11,
      machineId: "M012",
      machineName: "Máy 12",
      date: "2023-10-08",
      downtime: "03:00:00",
      errorTime: "04:30:00",
      targetLength: "1100 m",
      totalLength: "1050 m",
      efficiency: "95.5%",
      errorCount: 2,
    },
  ]);

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      const filteredTableData = tableData.filter(
        (row) =>
          (selectedErrorCode === "all" || row.errorCount > 0) &&
          row.machineId >= fromMachine &&
          row.machineId <= toMachine &&
          new Date(row.date) >= new Date(fromDate) &&
          new Date(row.date) <= new Date(toDate)
      );
      setTableData(filteredTableData);
      setIsLoading(false);
    }, 800);
  };

  const exportReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Báo cáo đã được xuất thành công (${fromDate} đến ${toDate})`);
    }, 1000);
  };

  const statistics = useMemo(
    () => ({
      totalMachinesWithErrors: tableData.reduce((acc, curr) => {
        if (!acc.includes(curr.machineId)) acc.push(curr.machineId);
        return acc;
      }, []).length,
      totalErrors: tableData.reduce((acc, curr) => acc + curr.errorCount, 0),
      totalDowntime:
        tableData
          .reduce((acc, curr) => {
            const [hours, minutes, seconds] = curr.downtime
              .split(":")
              .map(Number);
            return acc + hours * 3600 + minutes * 60 + seconds;
          }, 0)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " giây",
    }),
    [tableData]
  );

  const machines = [
    "M001",
    "M002",
    "M003",
    "M004",
    "M005",
    "M006",
    "M007",
    "M008",
    "M009",
    "M010",
    "M011",
    "M012",
  ];

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

      <div className="bg-gray-800 border-b border-gray-700 shadow-md">
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
                <h1 className="text-xl font-bold">Quản Lý Trạng Thái Máy</h1>
                <p className="text-sm text-gray-400">
                  Phân tích và quản lý máy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-6 py-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6 border border-gray-700">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
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
              Bộ Lọc Báo Cáo
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
        </div>
        {/* bảng danh sách */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Báo Cáo Lỗi Máy</h3>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 transition-colors"
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

            {/* Container với border và shadow để định rõ khu vực bảng */}
            <div className="border border-gray-700 rounded-lg shadow-inner bg-gray-800/50">
              {/* Container với chiều cao cố định và thanh cuộn rõ ràng */}
              <div
                className="max-h-[650px] overflow-y-scroll overflow-x-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#4B5563 #1F2937",
                }}
              >
                <table className="w-full text-left text-xl font-bold">
                  <thead className="bg-gray-700 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4 font-semibold">STT</th>
                      <th className="py-3 px-4 font-semibold">ID MÁY</th>
                      <th className="py-3 px-4 font-semibold">TÊN MÁY</th>
                      <th className="py-3 px-4 font-semibold">NGÀY</th>
                      <th className="py-3 px-4 font-semibold">TG DỪNG MÁY</th>
                      <th className="py-3 px-4 font-semibold">TG MÁY LỖI</th>
                      <th className="py-3 px-4 font-semibold">SỐ MÉT ĐẶT</th>
                      <th className="py-3 px-4 font-semibold">TỔNG SỐ MÉT</th>
                      <th className="py-3 px-4 font-semibold">HIỆU SUẤT</th>
                      <th className="py-3 px-4 font-semibold">SỐ LỖI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`${
                          index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                        } hover:bg-gray-600 transition-colors`}
                      >
                        <td className="py-3 px-4 text-xl">{index + 1}</td>
                        <td className="py-3 px-4 text-xl">{row.machineId}</td>
                        <td className="py-3 px-4 text-xl">{row.machineName}</td>
                        <td className="py-3 px-4 text-xl">
                          {new Date(row.date).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-3 px-4 text-xl">{row.downtime}</td>
                        <td className="py-3 px-4 text-xl">{row.errorTime}</td>
                        <td className="py-3 px-4 text-xl">
                          {row.targetLength}
                        </td>
                        <td className="py-3 px-4 text-xl">{row.totalLength}</td>
                        <td className="py-3 px-4 text-xl">{row.efficiency}</td>
                        <td className="py-3 px-4 text-xl">{row.errorCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {tableData.length === 0 && (
              <div className="text-center py-6 text-gray-400">
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

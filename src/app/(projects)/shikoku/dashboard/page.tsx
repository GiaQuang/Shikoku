"use client";
import React, { useState, useMemo } from "react";
import { useInterval } from "usehooks-ts";
import Link from "next/link";
import ReactECharts from "echarts-for-react";
import { api_get_full_machines } from "../api";

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
  status: boolean;
  so_met_dat: number;
  so_met_thuc: number;
  toc_do_dat: number;
  toc_do_thuc: number;
  hieu_suat: number;
  ma_loi: ErrorCode;
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
    averageEfficiency: 0,
    errorDistribution: {} as Record<string, number>,
    highEfficiencyMachines: 0,
    lowEfficiencyMachines: 0,
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

  const mapErrorToStatusType = (errorCode: ErrorCode): number => {
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

  useInterval(async () => {
    setCycle(null);
    try {
      const res = await api_get_full_machines();
      if (!res) {
        console.log("Lỗi lấy dữ liệu từ API");
        setCycle(3000);
        return;
      }

      console.log("Lấy data từ API: OK", res);
      const data = res instanceof Response ? await res.json() : res;

      const machines: MachineData[] = data.machines;
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
        const statusType = machine.status
          ? machine.toc_do_thuc > 0
            ? 0
            : 1
          : 2;
        return {
          id: `MÁY ${String(machine.id).padStart(2, "0")}`,
          statusType: machine.ma_loi
            ? mapErrorToStatusType(machine.ma_loi)
            : statusType,
          statusName: getStatusName(statusType),
        };
      });

      setSystemData({
        totalMachines: data.tong_may,
        runningMachines: data.may_dang_chay,
        stoppedMachines: data.may_dang_dung,
        offMachines: data.tong_may - data.may_dang_chay - data.may_dang_dung,
        averageEfficiency: data.hieu_suat_trung_binh,
        errorDistribution,
        highEfficiencyMachines: data.hieu_suat_cao,
        lowEfficiencyMachines: data.hieu_suat_thap,
        machinesByError,
        totalActualMeters: data.tong_so_met_thuc_te,
        totalTargetMeters: data.tong_so_met_thuc_te + data.tong_so_met_con_lai,
        machineStatuses,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setCycle(1000);
    }
  }, cycle);

  const formatNumber = (num: number) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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
        textStyle: { color: "#e5e7eb", fontSize: 18 },
      },
      tooltip: {
        position: "top",
        formatter: (params: any) => {
          const groupIndex = params.data[1];
          const machineIndex = params.data[0];
          const machineId = reversedMachineGroups[groupIndex][machineIndex];
          const status = statusTypes.find((s) => s.value === params.data[2]);
          return `${machineId}: ${status?.name || "Không xác định"}`;
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
          { min: 1, max: 1, label: "Máy dừng", color: "#9ca3af" },
          { min: 2, max: 2, label: "Máy tắt", color: "#3b82f6" },
          { min: 3, max: 3, label: "Đứt sợi trên", color: "#f87171" },
          { min: 4, max: 4, label: "Đứt sợi dưới", color: "#fbbf24" },
          { min: 5, max: 5, label: "Đứt lõi cách điện", color: "#60a5fa" },
          { min: 6, max: 6, label: "Đứt lõi băng nhôm", color: "#facc15" },
          { min: 7, max: 7, label: "Lỗi khác", color: "#a78bfa" },
        ],
        textStyle: { color: "#e5e7eb", fontSize: 14, fontWeight: "bold" },
        itemWidth: 30,
        itemHeight: 20,
        itemGap: 20,
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
            fontSize: 10,
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-indigo-500 text-transparent bg-clip-text">
            Dashboard ({totalMachines} máy)
          </h1>
          <Link
            href="/shikoku/dashboard_chi_tiet"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-5 py-2.5 rounded-lg flex items-center text-sm font-medium transition-all duration-300"
          >
            <span>Xem chi tiết từng máy</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
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
                <div className="text-xs text-gray-400">Đang chạy</div>
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

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
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
                {systemData.averageEfficiency}%
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

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-200">
                Tổng số lỗi trong ngày
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

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700">
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
                {Math.round(
                  (systemData.totalActualMeters /
                    systemData.totalTargetMeters) *
                    100
                )}
                %
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs text-gray-400">Mét thực tế</div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                  <div className="text-base font-semibold text-blue-400">
                    {formatNumber(systemData.totalActualMeters)}
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/40 p-2 rounded-lg">
                <div className="text-xs text-gray-400">Mét mục tiêu</div>
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
          <h2 className="text-2xl font-semibold text-gray-200 text-center mb-6">
            Biểu đồ nhiệt trạng thái máy
          </h2>
          <div className="relative h-[620px] w-full">
            <ReactECharts
              option={heatmapOption}
              style={{ height: "100%", width: "100%" }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

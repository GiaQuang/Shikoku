"use client";
import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { toast } from "react-toastify";

const MachineChart = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [displayYear, setDisplayYear] = useState(
    new Date().getFullYear().toString()
  );
  const [chart, setChart] = useState<echarts.ECharts | null>(null);
  const [errorStats, setErrorStats] = useState<{ [key: string]: number }>({});

  // Hàm tạo dữ liệu ngẫu nhiên cho biểu đồ (12 tháng)
  const generateRandomData = () => {
    return Array.from({ length: 12 }, () => (Math.random() * 500).toFixed(1));
  };

  // Các dữ liệu cố định cho biểu đồ
  const errorCategories = [
    { name: "Đứt sợi", color: "#FF4560" },
    { name: "Đứt lõi", color: "#008FFB" },
    { name: "Đứt băng nhôm", color: "#FEB019" },
    { name: "Lỗi khác", color: "#9E44F8" },
  ];

  // Tạo dữ liệu mẫu - Đã sửa thành biểu đồ 4 cột (không còn stack)
  const generateChartData = () => {
    // Tạo dữ liệu cho tất cả các loại lỗi
    const allData = errorCategories.map((category) => {
      const monthlyData = generateRandomData();

      // Tính tổng thời gian lỗi cho mỗi loại
      const totalHours = monthlyData.reduce(
        (sum, val) => sum + parseFloat(val),
        0
      );

      return {
        name: category.name,
        type: "bar",
        emphasis: {
          focus: "series",
        },
        itemStyle: { color: category.color },
        data: monthlyData,
        markPoint: {
          data: [
            { type: "max", name: "Max" },
            { type: "min", name: "Min" },
          ],
        },
        barMaxWidth: 25,
        barGap: "5%",
        totalHours: totalHours.toFixed(0),
      };
    });

    // Cập nhật thống kê tổng thời gian lỗi
    const newErrorStats: { [key: string]: number } = {};
    allData.forEach((data) => {
      newErrorStats[data.name] = parseInt(data.totalHours);
    });
    setErrorStats(newErrorStats);

    return allData;
  };

  // Cập nhật biểu đồ
  const updateChart = () => {
    if (!chart) return;

    const year = displayYear;
    const textColor = "#FFFFFF";
    const gridLineColor = "rgba(255, 255, 255, 0.1)";
    const backgroundColor = "transparent";

    // Tạo dữ liệu mới
    const seriesData = generateChartData();

    const option = {
      backgroundColor: backgroundColor,
      title: {
        text: `Thống Kê Lỗi Sản Xuất Năm ${year}`,
        subtext: "Phân tích theo loại lỗi và thời gian",
        left: "center",
        textStyle: {
          fontSize: 22,
          fontWeight: "bold",
          color: textColor,
        },
        subtextStyle: {
          fontSize: 14,
          color: "#aaa",
        },
        padding: [20, 10, 30, 10],
      },
      grid: {
        top: 120,
        bottom: 100,
        left: 60,
        right: 60,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params: any) {
          // Tính tổng tất cả giá trị lỗi
          let totalTime = params.reduce(
            (sum: number, item: any) => sum + item.value,
            0
          );

          // Tạo nội dung chi tiết từng lỗi
          let details = params
            .map(
              (item: any) =>
                `<div style="display: flex; align-items: center; justify-content: space-between; margin: 3px 0;">
                  <span style="display: inline-block; margin-right: 5px; border-radius: 10px; width: 10px; height: 10px; background-color: ${item.color};"></span>
                  <span style="flex: 1; min-width: 120px;">${item.seriesName}:</span>
                  <span style="font-weight: bold; text-align: right;">${item.value} giờ</span>
                </div>`
            )
            .join("");

          return `
            <div style="padding: 10px; background-color: rgba(50, 50, 50, 0.9); border-radius: 8px; border: 1px solid #555; color: #fff;">
              <div style="font-weight: bold; font-size: 16px; text-align: center; margin-bottom: 10px;">${params[0].axisValue}</div>
              <div style="font-size: 14px; font-weight: bold; color: #ff6666; text-align: center; margin-bottom: 10px;">
                
              </div>
              <div>${details}</div>
            </div>
          `;
        }, //Tổng thời gian lỗi: ${totalTime} giờ
        backgroundColor: "rgba(50,50,50,0.9)",
        borderColor: "#555",
        textStyle: {
          color: "#fff",
        },
      },

      legend: {
        data: errorCategories.map((c) => c.name),
        bottom: 5,
        itemGap: 30,
        textStyle: {
          fontSize: 20,
          color: textColor,
        },
        icon: "roundRect",
        itemWidth: 20,
        itemHeight: 16,
        borderRadius: 4,
      },
      toolbox: {
        feature: {
          dataView: {
            show: true,
            readOnly: false,
            title: "Dữ liệu",
            lang: ["Dữ liệu", "Đóng", "Làm mới"],
          },
          magicType: {
            show: true,
            type: ["line", "bar"],
            title: {
              line: "Chuyển sang Đường",
              bar: "Chuyển sang Cột",
            },
          },
          restore: {
            show: true,
            title: "Khôi phục",
          },
          saveAsImage: {
            show: true,
            title: "Lưu ảnh",
            pixelRatio: 2,
          },
          dataZoom: {
            yAxisIndex: "none",
            title: {
              zoom: "Phóng to",
              back: "Khôi phục",
            },
          },
        },
        right: 30,
        top: 20,
      },
      calculable: true,
      dataZoom: [
        {
          type: "slider",
          show: true,
          height: 10,
          bottom: 60,
          start: 0,
          end: 100,
          borderColor: gridLineColor,
        },
        {
          type: "inside", // Thêm dataZoom bên trong để có thể kéo/zoom trực tiếp
          start: 0,
          end: 100,
        },
      ],
      xAxis: [
        {
          type: "category",
          data: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
          nameLocation: "middle",
          nameGap: 30,
          axisLine: {
            lineStyle: {
              color: textColor,
            },
          },
          axisLabel: {
            color: textColor,
            fontSize: 20,
            interval: 0,
            rotate: 0,
          },
          splitLine: {
            show: false,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "Thời gian lỗi (giờ)",
          nameTextStyle: {
            fontSize: 14,
            color: textColor,
            padding: [0, 0, 0, 40],
          },
          axisLine: {
            lineStyle: {
              color: textColor,
            },
          },
          axisLabel: {
            color: textColor,
            fontSize: 12,
          },
          splitLine: {
            lineStyle: {
              color: gridLineColor,
              type: "dashed",
            },
          },
        },
      ],
      series: seriesData,
    };

    chart.setOption(option, true);
  };

  // Khởi tạo biểu đồ
  useEffect(() => {
    if (chartRef.current && !chart) {
      // Đăng ký theme tối
      echarts.registerTheme("dark-theme", {
        backgroundColor: "transparent",
        textStyle: {
          color: "#FFFFFF",
        },
      });

      const newChart = echarts.init(chartRef.current, "dark-theme");

      setChart(newChart);

      const resizeObserver = new ResizeObserver(() => {
        newChart.resize();
      });

      resizeObserver.observe(chartRef.current);

      const handleResize = () => {
        newChart.resize();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        newChart.dispose();
        window.removeEventListener("resize", handleResize);
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Khởi tạo biểu đồ và dữ liệu ban đầu
  useEffect(() => {
    if (chart) {
      updateChart();
    }
  }, [chart, displayYear]); // Chỉ cập nhật khi chart hoặc displayYear thay đổi

  // Xử lý khi người dùng thay đổi năm
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedYear(e.target.value);
  };

  // Xử lý khi người dùng nhấn nút tìm kiếm
  const handleSearch = () => {
    setDisplayYear(selectedYear); // Cập nhật displayYear sẽ trigger useEffect để cập nhật biểu đồ
    toast.success(`Đã tìm kiếm dữ liệu lỗi năm ${selectedYear}`);
  };

  // Chức năng xuất báo cáo
  const exportReport = () => {
    if (!chart) return;

    // Hiển thị thông báo khi người dùng xuất báo cáo
    toast.success(`Đang xuất báo cáo thống kê lỗi năm ${displayYear}`);

    // Lưu hình ảnh biểu đồ
    const url = chart.getDataURL({
      pixelRatio: 2,
      backgroundColor: "#1F2937",
    });

    // Tạo liên kết tải xuống
    const link = document.createElement("a");
    link.download = `Thong_ke_loi_nam_${displayYear}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-8xl mx-auto">
        {/* Panel điều khiển phía trên */}
        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-4 rounded-lg bg-opacity-20 backdrop-blur-sm border border-opacity-20 shadow-lg"
          style={{
            backgroundColor: "rgba(30,41,59,0.8)",
            borderColor: "rgba(75,85,99,0.8)",
          }}
        >
          <div className="text-2xl font-bold">Phân Tích Lỗi Theo Năm</div>

          <div className="flex flex-wrap items-center gap-4">
            <label
              className="flex items-center gap-2 bg-opacity-30 p-2 rounded"
              style={{ backgroundColor: "rgba(55,65,81,0.5)" }}
            >
              <span>Năm:</span>
              <input
                type="number"
                value={selectedYear}
                onChange={handleYearChange}
                className="bg-gray-800 text-white border rounded p-2 w-24 outline-none"
                style={{ borderColor: "#4B5563" }}
                min="2000"
                max="2100"
              />
            </label>

            <button
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow-md transition-colors flex items-center gap-2"
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

            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-md transition-colors flex items-center gap-2"
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
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Biểu đồ chính */}
        <div className="w-full h-[780px] rounded-xl overflow-hidden shadow-2xl bg-gray-800">
          <div ref={chartRef} className="w-full h-full" />
        </div>

        {/* Thông tin thống kê bổ sung */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {errorCategories.map((category, index) => (
            <div
              key={index}
              className="p-4 rounded-lg shadow-lg flex items-center gap-3"
              style={{
                backgroundColor: "rgba(30,41,59,0.8)",
                borderLeft: `4px solid ${category.color}`,
              }}
            >
              <div
                className="p-3 rounded-full"
                style={{ backgroundColor: `${category.color}30` }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={category.color}
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm opacity-70">Lỗi {category.name}</div>
                <div className="text-xl font-bold">
                  {errorStats[category.name] || 0} giờ
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MachineChart;

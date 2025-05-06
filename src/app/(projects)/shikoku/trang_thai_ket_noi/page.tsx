// "use client";
// import { useState } from "react";

// // Tạo dữ liệu mẫu
// const machines = Array.from({ length: 200 }, (_, i) => ({
//   name: `Máy ${i + 1}`,
//   ip: `192.168.1.${i + 1}`,
//   status: Math.random() > 0.5 ? "✅ Kết nối" : "❌ Mất kết nối",
//   lastSeen: new Date(Date.now() - Math.random() * 10000000000).toLocaleString(
//     "vi-VN"
//   ),
// }));

// const PAGE_SIZE = 17; // Số lượng máy hiển thị trên mỗi trang
// const TABLES_PER_PAGE = 2; // Số bảng hiển thị cạnh nhau
// const TOTAL_ITEMS_PER_PAGE = PAGE_SIZE * TABLES_PER_PAGE; // Tổng số máy hiển thị trên cả hai bảng

// export default function MachineTable() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");

//   // Lọc máy theo từ khóa tìm kiếm và trạng thái
//   const filteredMachines = machines.filter((machine) => {
//     const matchesSearch =
//       machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       machine.ip.includes(searchTerm);

//     if (filterStatus === "all") return matchesSearch;
//     if (filterStatus === "connected")
//       return matchesSearch && machine.status.includes("Kết nối");
//     if (filterStatus === "disconnected")
//       return matchesSearch && machine.status.includes("Mất kết nối");

//     return matchesSearch;
//   });

//   // Tính toán cho trang hiện tại
//   const totalPages = Math.ceil(filteredMachines.length / TOTAL_ITEMS_PER_PAGE);
//   const startIdx = (currentPage - 1) * TOTAL_ITEMS_PER_PAGE;

//   // Chia thiết bị thành hai bảng
//   const currentMachinesLeft = filteredMachines.slice(
//     startIdx,
//     startIdx + PAGE_SIZE
//   );
//   const currentMachinesRight = filteredMachines.slice(
//     startIdx + PAGE_SIZE,
//     startIdx + TOTAL_ITEMS_PER_PAGE
//   );

//   // Thống kê nhanh
//   const connectedCount = filteredMachines.filter((m) =>
//     m.status.includes("Kết nối")
//   ).length;
//   const disconnectedCount = filteredMachines.filter((m) =>
//     m.status.includes("Mất kết nối")
//   ).length;

//   // Component cho một bảng thiết bị
//   const SingleTable = ({ machines, startIndex }) => (
//     <div className="bg-gray-800 rounded-lg shadow flex-grow flex flex-col overflow-hidden">
//       <div className="overflow-auto flex-grow">
//         <table className="min-w-full border-collapse">
//           <thead className="bg-gray-700 sticky top-0">
//             <tr>
//               <th className="px-2 py-2 text-left text-xl font-bold text-gray-300 uppercase tracking-wider">
//                 TÊN MÁY
//               </th>
//               <th className="px-2 py-2 text-left text-xl font-bold text-gray-300 uppercase tracking-wider">
//                 ĐỊA CHỈ IP
//               </th>
//               <th className="px-2 py-2 text-left text-xl font-bold text-gray-300 uppercase tracking-wider">
//                 CẬP NHẬT CUỐI
//               </th>
//               <th className="px-2 py-2 text-left text-xl font-bold text-gray-300 uppercase tracking-wider">
//                 TRẠNG THÁI
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-700">
//             {machines.map((machine, index) => (
//               <tr key={index} className="hover:bg-gray-700">
//                 <td className="px-2 py-2 whitespace-nowrap text-lg font-medium text-gray-200">
//                   {machine.name}
//                 </td>
//                 <td className="px-2 py-2 whitespace-nowrap text-lg text-gray-300">
//                   {machine.ip}
//                 </td>
//                 <td className="px-2 py-2 whitespace-nowrap text-lg text-gray-300">
//                   {machine.lastSeen}
//                 </td>
//                 <td className="px-2 py-2 whitespace-nowrap">
//                   <span
//                     className={`px-2 py-1 text-base font-medium rounded-full ${
//                       machine.status.includes("Kết nối")
//                         ? "bg-green-900 text-green-300"
//                         : "bg-red-900 text-red-300"
//                     }`}
//                   >
//                     {machine.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {machines.length === 0 && (
//         <div className="text-center py-4 flex-grow">
//           <p className="text-gray-400 text-base">Không tìm thấy thiết bị nào</p>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <div className="w-full h-screen flex flex-col bg-gray-900 text-gray-100 overflow-hidden">
//       <div className="p-2 md:p-4 flex-grow flex flex-col overflow-hidden">
//         <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-100">
//           Trạng thái kết nối
//         </h2>

//         {/* Thống kê */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
//           <div className="bg-gray-800 rounded-lg shadow p-2 border-l-4 border-blue-500">
//             <p className="text-sm text-gray-400">Tổng số thiết bị</p>
//             <p className="text-2xl font-bold">{filteredMachines.length}</p>
//           </div>
//           <div className="bg-gray-800 rounded-lg shadow p-2 border-l-4 border-green-500">
//             <p className="text-sm text-gray-400">Đang kết nối</p>
//             <p className="text-2xl font-bold text-green-400">
//               {connectedCount}
//             </p>
//           </div>
//           <div className="bg-gray-800 rounded-lg shadow p-2 border-l-4 border-red-500">
//             <p className="text-sm text-gray-400">Mất kết nối</p>
//             <p className="text-2xl font-bold text-red-400">
//               {disconnectedCount}
//             </p>
//           </div>
//         </div>

//         {/* Công cụ tìm kiếm và lọc */}
//         <div className="bg-gray-800 rounded-lg shadow mb-2 p-2">
//           <div className="flex flex-col md:flex-row gap-2">
//             <div className="flex-grow">
//               <input
//                 type="text"
//                 placeholder="Tìm kiếm theo tên máy hoặc IP..."
//                 className="w-full p-2 border rounded-lg bg-gray-700 border-gray-600 text-white text-base placeholder-gray-400 focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setCurrentPage(1);
//                 }}
//               />
//             </div>
//             <div className="md:w-64">
//               <select
//                 className="w-full p-2 border rounded-lg bg-gray-700 border-gray-600 text-white text-base focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 value={filterStatus}
//                 onChange={(e) => {
//                   setFilterStatus(e.target.value);
//                   setCurrentPage(1);
//                 }}
//               >
//                 <option value="all">Tất cả trạng thái</option>
//                 <option value="connected">Đang kết nối</option>
//                 <option value="disconnected">Mất kết nối</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Container cho hai bảng */}
//         <div className="flex flex-col md:flex-row gap-2 flex-grow overflow-hidden">
//           {/* Bảng bên trái */}
//           <div className="flex-1 flex flex-col overflow-hidden">
//             <SingleTable machines={currentMachinesLeft} startIndex={startIdx} />
//           </div>

//           {/* Bảng bên phải */}
//           <div className="flex-1 flex flex-col overflow-hidden">
//             <SingleTable
//               machines={currentMachinesRight}
//               startIndex={startIdx + PAGE_SIZE}
//             />
//           </div>
//         </div>

//         {/* Phân trang */}
//         <div className="bg-gray-700 px-2 py-2 flex items-center justify-between border-t border-gray-600 mt-2">
//           <div className="flex-1 flex justify-between">
//             <div>
//               <p className="text-sm text-gray-300">
//                 Hiển thị <span className="font-medium">{startIdx + 1}</span> đến{" "}
//                 <span className="font-medium">
//                   {Math.min(
//                     startIdx + TOTAL_ITEMS_PER_PAGE,
//                     filteredMachines.length
//                   )}
//                 </span>{" "}
//                 trong tổng số{" "}
//                 <span className="font-medium">{filteredMachines.length}</span>{" "}
//                 thiết bị
//               </p>
//             </div>
//             <div>
//               <nav
//                 className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
//                 aria-label="Pagination"
//               >
//                 <button
//                   className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-600 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
//                   disabled={currentPage === 1}
//                   onClick={() => setCurrentPage(1)}
//                 >
//                   ⏮ Đầu
//                 </button>
//                 <button
//                   className="relative inline-flex items-center px-2 py-1 border border-gray-600 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
//                   disabled={currentPage === 1}
//                   onClick={() => setCurrentPage((prev) => prev - 1)}
//                 >
//                   ⬅ Trước
//                 </button>
//                 <span className="relative inline-flex items-center px-2 py-1 border border-gray-600 bg-gray-800 text-base font-medium text-gray-300">
//                   Trang {currentPage} / {totalPages || 1}
//                 </span>
//                 <button
//                   className="relative inline-flex items-center px-2 py-1 border border-gray-600 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
//                   disabled={currentPage === totalPages || totalPages === 0}
//                   onClick={() => setCurrentPage((prev) => prev + 1)}
//                 >
//                   Sau ➡
//                 </button>
//                 <button
//                   className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-600 bg-gray-800 text-base font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
//                   disabled={currentPage === totalPages || totalPages === 0}
//                   onClick={() => setCurrentPage(totalPages)}
//                 >
//                   Cuối ⏭️
//                 </button>
//               </nav>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";

// Tạo dữ liệu mẫu
const machines = Array.from({ length: 200 }, (_, i) => ({
  name: `Máy ${i + 1}`,
  ip: `192.168.1.${i + 1}`,
  status: Math.random() > 0.5 ? "✅ Kết nối" : "❌ Mất kết nối",
  lastSeen: new Date(Date.now() - Math.random() * 10000000000).toLocaleString(
    "vi-VN"
  ),
}));

const PAGE_SIZE = 12; // Số lượng máy hiển thị trên mỗi trang
const TABLES_PER_PAGE = 2; // Số bảng hiển thị cạnh nhau
const TOTAL_ITEMS_PER_PAGE = PAGE_SIZE * TABLES_PER_PAGE; // Tổng số máy hiển thị trên cả hai bảng

export default function MachineTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Lọc máy theo từ khóa tìm kiếm và trạng thái
  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.ip.includes(searchTerm);

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "connected")
      return matchesSearch && machine.status.includes("Kết nối");
    if (filterStatus === "disconnected")
      return matchesSearch && machine.status.includes("Mất kết nối");

    return matchesSearch;
  });

  // Tính toán cho trang hiện tại
  const totalPages = Math.ceil(filteredMachines.length / TOTAL_ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * TOTAL_ITEMS_PER_PAGE;

  // Chia thiết bị thành hai bảng
  const currentMachinesLeft = filteredMachines.slice(
    startIdx,
    startIdx + PAGE_SIZE
  );
  const currentMachinesRight = filteredMachines.slice(
    startIdx + PAGE_SIZE,
    startIdx + TOTAL_ITEMS_PER_PAGE
  );

  // Thống kê nhanh
  const connectedCount = filteredMachines.filter((m) =>
    m.status.includes("Kết nối")
  ).length;
  const disconnectedCount = filteredMachines.filter((m) =>
    m.status.includes("Mất kết nối")
  ).length;

  // Hàm reload dữ liệu
  const handleReload = () => {
    // Ở đây chỉ là hiệu ứng tải lại
    setCurrentPage(1);
    setSearchTerm("");
    setFilterStatus("all");
    // Trong ứng dụng thực tế, bạn sẽ gọi API để lấy dữ liệu mới
  };

  // Component cho một bảng thiết bị
  const SingleTable = ({ machines, startIndex }: any) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex-grow flex flex-col overflow-hidden transition-all duration-300 ">
      <div className="overflow-auto flex-grow">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 sticky top-0 z-10">
            <tr>
              {["TÊN MÁY", "ĐỊA CHỈ IP", "CẬP NHẬT CUỐI", "TRẠNG THÁI"].map(
                (header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xl font-bold text-gray-200 uppercase tracking-wider border-b border-slate-700"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {machines.map((machine: any, index: any) => (
              <tr
                key={index}
                className="hover:bg-slate-700/50 transition-colors duration-200 group"
              >
                <td className="px-4 py-3 whitespace-nowrap text-xl font-medium text-gray-100 group-hover:text-white">
                  {machine.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xl text-gray-300 group-hover:text-white">
                  {machine.ip}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xl text-gray-300 group-hover:text-white">
                  {machine.lastSeen}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-base font-semibold rounded-full shadow-md transition-all duration-300 ${
                      machine.status.includes("Kết nối")
                        ? "bg-green-600/20 text-green-400 border border-green-500/30 group-hover:bg-green-600/40"
                        : "bg-red-600/20 text-red-400 border border-red-500/30 group-hover:bg-red-600/40"
                    }`}
                  >
                    {machine.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {machines.length === 0 && (
        <div className="text-center py-6 flex-grow">
          <p className="text-gray-400 text-base animate-pulse">
            Không tìm thấy thiết bị nào
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 overflow-hidden">
      <div className="p-4 md:p-6 flex-grow flex flex-col overflow-hidden">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent text-center bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          Trạng thái kết nối
        </h2>

        {/* Thống kê với icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            {
              label: "Tổng số thiết bị",
              value: filteredMachines.length,
              color: "border-blue-500",
              textColor: "text-blue-400",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              ),
            },
            {
              label: "Đang kết nối",
              value: connectedCount,
              color: "border-green-500",
              textColor: "text-green-400",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              ),
            },
            {
              label: "Mất kết nối",
              value: disconnectedCount,
              color: "border-red-500",
              textColor: "text-red-400",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              ),
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-4 border ${stat.color} transform transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">{stat.label}</p>
                {stat.icon}
              </div>
              <p className={`text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Công cụ tìm kiếm và lọc */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700 mb-4 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên máy hoặc IP..."
                className="w-full p-3 border rounded-xl bg-slate-700 border-slate-600 text-white text-base placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="md:w-64 flex">
              <select
                className="w-full p-3 border rounded-l-xl bg-slate-700 border-slate-600 text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="connected">Đang kết nối</option>
                <option value="disconnected">Mất kết nối</option>
              </select>
              <button
                onClick={handleReload}
                className="p-3 border border-l-0 rounded-r-xl bg-slate-700 border-slate-600 text-white hover:bg-slate-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Tải lại dữ liệu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Container cho hai bảng */}
        <div className="flex flex-col md:flex-row gap-4 flex-grow overflow-hidden">
          {/* Bảng bên trái */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <SingleTable machines={currentMachinesLeft} startIndex={startIdx} />
          </div>

          {/* Bảng bên phải */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <SingleTable
              machines={currentMachinesRight}
              startIndex={startIdx + PAGE_SIZE}
            />
          </div>
        </div>

        {/* Phân trang */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 flex items-center justify-between border-t border-slate-700 mt-4 rounded-b-2xl shadow-xl">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-300">
                Hiển thị <span className="font-medium">{startIdx + 1}</span> đến{" "}
                <span className="font-medium">
                  {Math.min(
                    startIdx + TOTAL_ITEMS_PER_PAGE,
                    filteredMachines.length
                  )}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{filteredMachines.length}</span>{" "}
                thiết bị
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                {[
                  {
                    label: "⏮ Đầu",
                    action: () => setCurrentPage(1),
                    disabled: currentPage === 1,
                  },
                  {
                    label: "⬅ Trước",
                    action: () => setCurrentPage((prev) => prev - 1),
                    disabled: currentPage === 1,
                  },
                  {
                    label: `Trang ${currentPage} / ${totalPages || 1}`,
                    action: () => {},
                    disabled: true,
                  },
                  {
                    label: "Sau ➡",
                    action: () => setCurrentPage((prev) => prev + 1),
                    disabled: currentPage === totalPages || totalPages === 0,
                  },
                  {
                    label: "Cuối ⏭",
                    action: () => setCurrentPage(totalPages),
                    disabled: currentPage === totalPages || totalPages === 0,
                  },
                ].map((btn, index) => (
                  <button
                    key={index}
                    className={`relative inline-flex items-center px-3 py-2 border border-slate-600 bg-slate-800 text-base font-medium text-gray-300 hover:bg-slate-700 disabled:opacity-50 transition-all duration-300 ${
                      index === 0
                        ? "rounded-l-xl"
                        : index === 4
                        ? "rounded-r-xl"
                        : ""
                    }`}
                    disabled={btn.disabled}
                    onClick={btn.action}
                  >
                    {btn.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

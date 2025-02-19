"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaTableCellsLarge } from "react-icons/fa6";
import {
  HomeOutlined,
  MailOutlined,
  OrderedListOutlined,
  SettingOutlined,
  BarChartOutlined,
  FileSearchOutlined,
  SolutionOutlined,
  HddOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";
import { MdOutlineElectricBolt } from "react-icons/md";
import { IoWaterOutline } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { usePathname, useRouter } from "next/navigation";
import { motion as m } from "framer-motion";
import { useSessionStorage } from "usehooks-ts";
export default function MyMenu({ set_is_show }: { set_is_show: Function }) {
  const [is_show, setIsShow, remove_is_show] = useSessionStorage(
    "key_show_menu",
    true
  );
  const pathName = usePathname();
  const router = useRouter();
  const items: any[] = [
    {
      key: "/shikoku/dashboard",
      icon: <LuLayoutDashboard style={{ fontSize: 24 }} />,
      label: <div className="text-sm"> {`Dashboard`}</div>,
      link: "/shikoku/dashboard",
      children: [],
    },
    {
      key: "/shikoku/thiet_bi",
      icon: <FaTableCellsLarge style={{ fontSize: 24 }} />,
      label: <div className="text-sm"> {`Thiết bị`}</div>,
      link: "/shikoku/thiet_bi",
      children: [],
    },
    {
      key: "/shikoku/thong_ke",
      icon: <BarChartOutlined style={{ fontSize: 24 }} />,
      label: <div className="text-sm">{`Thống kê`}</div>,
      link: `/shikoku/thong_ke`,
      children: [
        {
          key: "/shikoku/thong_ke/dien",
          icon: <MdOutlineElectricBolt style={{ fontSize: 24 }} />,
          label: <div className="text-sm">{`Điện`}</div>,
          link: `/shikoku/thong_ke/dien`,
        },
        {
          key: "/shikoku/thong_ke/nuoc",
          icon: <IoWaterOutline style={{ fontSize: 24 }} />,
          label: <div className="text-sm">{`Nước`}</div>,
          link: `/shikoku/thong_ke/nuoc`,
        },
      ],
    },
    {
      key: "cai_dat",
      icon: <SettingOutlined style={{ fontSize: 24 }} />,
      label: <div className="text-sm">{`Cài đặt`}</div>,
      link: `/shikoku/cai_dat`,
      children: [],
    },
    {
      key: "lien_he",
      icon: <MailOutlined style={{ fontSize: 24 }} />,
      label: <div className="text-sm">{`Liên hệ`}</div>,
      link: `/shikoku/lien_he`,
      children: [],
    },
  ];

  return (
    <m.div
      className={`flex flex-col h-full relative min-h-screen border-r-2 border-[#383749]`}
    >
      <div className="flex-1  flex flex-col gap-1">
        <div className="text-3xl flex items-center justify-center py-4 border-b-2 mb-2 px-1">
          <Image
            src="/logos/vna.png"
            alt="logo_vf"
            width={120}
            height={100}
          ></Image>
        </div>
        {items.map((item: any, index: number) => {
          if (is_show == false)
            return (
              <div
                className={`${
                  pathName.includes(item["key"]) ? `` : `opacity-30`
                }                                        
                                        `}
                key={item["key"]}
                onClick={() => {
                  if (item["children"].length == 0) router.push(item["link"]);
                  else {
                  }
                }}
              >
                <div className="flex flex-col gap-2">
                  <div
                    className={`flex flex-row gap-1 py-1 pl-2 
                                        hover:opacity-100 hover:-translate-y-1 duration-150 hover:cursor-pointer
                                        active:translate-y-0
                                    ${
                                      item["children"].length != 0
                                        ? `hidden`
                                        : ``
                                    }`}
                  >
                    {item["icon"]}
                  </div>
                  {item["children"].map((child: any, idx: number) => {
                    return (
                      <div
                        className={`pl-2 flex flex-row items-center
                                ${
                                  pathName.includes(child["key"])
                                    ? ``
                                    : `${
                                        pathName.includes(item["key"])
                                          ? `opacity-30`
                                          : ``
                                      }
                                    `
                                }
                                hover:opacity-100 hover:-translate-y-1 duration-150 hover:cursor-pointer
                                ${
                                  pathName.includes(item["key"])
                                    ? ``
                                    : `${
                                        idx == 0
                                          ? `hover:opacity-100 hover:-translate-y-1 duration-150 hover:cursor-pointer`
                                          : `opacity-100`
                                      }`
                                }
                                `}
                        key={child["key"]}
                        onClick={() => {
                          router.push(child["link"]);
                        }}
                      >
                        {child["icon"]}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          return (
            <div
              className={`${pathName.includes(item["key"]) ? `` : `opacity-30`}
                                    flex flex-col gap-1
                                    `}
              key={item["key"]}
            >
              <div
                className={`flex flex-row gap-1 py-1 pl-1 items-center
                                    hover:opacity-100 hover:-translate-y-1 duration-150 hover:cursor-pointer active:translate-y-0`}
                onClick={() => {
                  if (item["children"].length == 0) router.push(item["link"]);
                  else {
                    router.push(item["children"][0]["link"]);
                  }
                }}
              >
                {item["icon"]}
                {item["label"]}
              </div>
              {item["children"].map((child: any, idx: number) => {
                return (
                  <div
                    className={`pl-6 flex flex-row items-center gap-1
                                ${
                                  pathName.includes(child["key"])
                                    ? ``
                                    : `${
                                        pathName.includes(item["key"])
                                          ? `opacity-30`
                                          : ``
                                      }
                                    `
                                }
                                hover:opacity-100 hover:-translate-y-1 duration-150 hover:cursor-pointer
                                ${
                                  pathName.includes(item["key"])
                                    ? ``
                                    : `${
                                        idx == 0
                                          ? `hover:opacity-100 hover:-translate-y-1 duration-150 hover:cursor-pointer`
                                          : ``
                                      }`
                                }
                                `}
                    key={child["key"]}
                    onClick={() => {
                      router.push(child["link"]);
                    }}
                  >
                    {child["icon"]}
                    {child["label"]}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div
        className={`absolute bottom-1 right-1
                    hover:-translate-y-1 hover:cursor-pointer active:translate-y-0 duration-150`}
        onClick={() => {
          set_is_show(!is_show);
          setIsShow(!is_show);
        }}
      >
        {is_show && (
          <LeftCircleOutlined
            style={{
              fontSize: `30px`,
            }}
          />
        )}
        {!is_show && (
          <RightCircleOutlined
            style={{
              fontSize: `30px`,
            }}
          />
        )}
      </div>
    </m.div>
  );
}

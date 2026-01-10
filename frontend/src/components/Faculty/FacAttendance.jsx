"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { useManagement } from "@/context/ManagementContext";

const FacAttendance = () => {
  const list = ["latest", "oldest"];

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const getStatus = (lecture) => {
    const attendance = lecture.attendance?.[0];
    const now = new Date();

    if (attendance?.actualStartTime && attendance?.actualEndTime)
      return "Conducted";

    if (!attendance && new Date(lecture.endTime) < now) return "Missed";

    return "Planned";
  };

  const mapLecturesToUI = (lectures) => {
    return (
      lectures
        // 👉 sirf wahi jisme attendance mark hui ho (agar chaho)
        .filter((lec) => lec.attendance && lec.attendance.length > 0)

        // 👉 latest first
        .sort(
          (a, b) =>
            new Date(b.attendance[0].actualStartTime) -
            new Date(a.attendance[0].actualStartTime)
        )

        // 👉 last 5
        .slice(0, 5)

        .map((lec) => {
          const attendance = lec.attendance[0];

          return {
            date: formatDate(lec.StartDate),
            subject: lec.subject?.name || "-",
            plannedTime: `${formatTime(lec.startTime)} – ${formatTime(
              lec.endTime
            )}`,
            actualTime: attendance
              ? `${formatTime(attendance.actualStartTime)} – ${formatTime(
                  attendance.actualEndTime
                )}`
              : "-",
            status: getStatus(lec),
            penalty: attendance?.penalty || "NONE",
          };
        })
    );
  };

  const myLectureHeaders = [
    "Date",
    "Subject",
    "Planned Time",
    "Actual Time",
    "Status",
    "Penalty",
  ];

  // const myLecturesData = [
  //   {
  //     date: "06-Jan-2025",
  //     subject: "Mathematics",
  //     plannedTime: "10:00 – 11:00",
  //     actualTime: "10:05 – 11:00",
  //     status: "Conducted",
  //     penalty: "None",
  //   },
  //   {
  //     date: "05-Jan-2025",
  //     subject: "Physics",
  //     plannedTime: "11:00 – 12:00",
  //     actualTime: "11:25 – 12:00",
  //     status: "Conducted",
  //     penalty: "Late Start",
  //   },
  //   {
  //     date: "04-Jan-2025",
  //     subject: "Chemistry",
  //     plannedTime: "09:30 – 10:30",
  //     actualTime: "-",
  //     status: "Missed",
  //     penalty: "Both",
  //   },
  //   {
  //     date: "07-Jan-2025",
  //     subject: "Computer Science",
  //     plannedTime: "02:00 – 03:00",
  //     actualTime: "-",
  //     status: "Upcoming",
  //     penalty: "-",
  //   },
  // ];


  const {fetchLecture} = useManagement()
  const [serverdata, setServerdata] = useState([])
  const [myLecturesData, setMyLecturesData] = useState([]);

  useEffect(() => {
    const tok = JSON.parse(localStorage.getItem("user"));
    const id = tok.data.user.id;
    console.log(tok.data.user);
    const loadData = async () => {
      const data = await fetchLecture();

      const filterData = data.filter((user) => user.facultyId === id);
      console.log(filterData);
      setServerdata(filterData);
    };
    loadData();
  }, []);

  useEffect(() => {
    const uiData = mapLecturesToUI(serverdata);
    console.log(uiData)
    setMyLecturesData(uiData);
  }, [serverdata]);

  return (
    <>
      <div className="h-full bg-white m-2 rounded flex flex-col overflow-hidden items-center">
        {/* filter */}
        {/* <div className="w-full flex justify-end p-2  gap-2">
          <Label htmlFor={`Sort`} className={`uppercase`}>
            SortBy:
          </Label>
          <Select>
            <SelectTrigger id={`Sort`}>
              <SelectValue placeholder={`SortBy`} />
            </SelectTrigger>
            <SelectContent>
              {list.map((item, i) => (
                <SelectItem key={i} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

        {/* data */}
        <div className="w-[98%]  h-full overflow-auto xl:overflow-x-hidden">
          <ul className="grid grid-cols-[100px_180px_260px_220px_140px_140px] xl:grid-cols-6 text-center border-b p-2 font-semibold">
            {myLectureHeaders.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          {/* {myLecturesData.map((item, i) => (
            <ul key={i} className="grid grid-cols-6 text-center border-b p-2">
              <li>{item.date}</li>
              <li>{item.subject}</li>
              <li>{item.plannedTime}</li>
              <li>{item.actualTime}</li>
              <li>{item.status}</li>
              <li>{item.penalty}</li>
            </ul>
          ))} */}

          {myLecturesData.map((item, i) => (
            <ul key={i} className="grid grid-cols-[100px_180px_260px_220px_140px_140px] xl:grid-cols-6 text-center border-b p-2">
              <li>{item.date}</li>
              <li>{item.subject}</li>
              <li>{item.plannedTime}</li>
              <li>{item.actualTime}</li>
              <li
                className={
                  item.status === "Conducted"
                    ? "text-green-600"
                    : item.status === "Missed"
                    ? "text-red-600"
                    : "text-yellow-600"
                }
              >
                {item.status}
              </li>
              <li>{item.penalty}</li>
            </ul>
          ))}
          
        </div>
      </div>
    </>
  );
};

export default FacAttendance;

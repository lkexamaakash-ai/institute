"use client";
import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { mainRoute } from "../apiroute";

const StaffAttendance = () => {
  const list = ["latest", "oldest"];

  const [sortBy, setSortBy] = useState("latest");

  const attendanceHistoryHeaders = [
    "Date",
    "Shift Time",
    "In Time",
    "Out Time",
    "Late",
    "Overtime (mins)",
    "Overtime Pay (₹)",
  ];

  const [attendanceHistoryData, setAttendanceHistoryData] = useState([]);
  const [staffData, setStaffData] = useState([]);

  useEffect(() => {
    let tokn = JSON.parse(localStorage.getItem("user"));
    let token = tokn.data.token;

    const loadData = async () => {
      const { data } = await axios.get(
        `${mainRoute}/api/users/role/dash`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const facultyData = data.data.faculty
        .filter((user) => user.id === tokn.data.user.id)
        .find((user) => user.branchId === tokn.data.user.branch.id);
      console.log(facultyData);

      setStaffData(facultyData);
    };

    loadData();
  }, []);

  const sortedAttendance = [...attendanceHistoryData].sort((a, b) => {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);

  if (sortBy === "latest") {
    return dateB - dateA; // newest first
  } else {
    return dateA - dateB; // oldest first
  }
});


  useEffect(() => {
    console.log(staffData?.staffAttendances);
    setAttendanceHistoryData(staffData?.staffAttendances || []);
  }, [staffData]);

  const formatTime = (isoTime) => {
    return new Date(isoTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <div className="h-full bg-white m-2 rounded flex flex-col overflow-hidden items-center">
        {/* filter */}
        <div className="w-full flex justify-end p-2  gap-2">
          <Label htmlFor={`Sort`} className={`uppercase`}>
            SortBy:
          </Label>
          <Select onValueChange={(v) => setSortBy(v)} defaultValue="latest">
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
        </div>

        {/* Attendance */}

        <div className="w-[98%]  h-[92%] overflow-auto xl:overflow-x-hidden">
          <ul className="grid grid-cols-[100px_180px_260px_220px_140px_140px_150px] xl:grid-cols-7 text-center xl:border-b p-2 font-semibold">
            {attendanceHistoryHeaders.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          {sortedAttendance.map((item, i) => (
            <ul key={i} className="grid  grid-cols-[100px_180px_260px_220px_140px_140px_150px] xl:grid-cols-7 text-center xl:border-b p-2">
              <li>{formatDate(item.date)}</li>
              <li>{`${formatTime(item.shiftStartTime)}-${formatTime(
                item.shiftEndTime
              )}`}</li>
              <li>{formatTime(item.actualInTime)}</li>
              <li>{formatTime(item.actualOutTime)}</li>
              <li>{item.isLate ? "Yes" : "No"}</li>
              <li>{item.overtimeMinutes}min</li>
              <li>₹{item.overtimePay}</li>
            </ul>
          ))}
        </div>
      </div>
    </>
  );
};

export default StaffAttendance;

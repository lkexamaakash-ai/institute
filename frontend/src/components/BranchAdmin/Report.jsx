"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { useManagement } from "@/context/ManagementContext";
import { Input } from "../ui/input";

const Report = () => {
  const getFacultyPenaltyCount = (faculty) => {
    const counts = {
      LATE_START: 0,
      EARLY_END: 0,
      BOTH: 0,
      TOTAL: 0,
    };

    faculty.lectures.forEach((lec) => {
      if (!Array.isArray(lec.attendance)) return;

      lec.attendance.forEach((att) => {
        if (!att.penalty || att.penalty === "NONE") return;

        counts[att.penalty]++;
        counts.TOTAL++;
      });
    });

    return counts;
  };

  const [role, setRole] = useState(null);
  const [branch, setBranch] = useState(null);
  const [bran, setBran] = useState({});

  const facultyReportHeaders = [
    "id",
    "Faculty Name",
    "Lectures Done",
    "Remaining Lectures",
    "Late",
    "Early",
    "Both",
    "Total Penalty",
  ];

  const [facultyReportData, setFacultyReportData] = useState([]);
  const [staffReportData, setStaffReportData] = useState([]);
  const { fetchUser, fetchBranch } = useManagement();

  useEffect(() => {
    const tok = JSON.parse(localStorage.getItem("user"));
    const branch = tok.data.user.branch;

    setBran(branch);

    const loadData = async () => {
      const branchdata = await fetchBranch();

      setBranch(branchdata);
    };
    loadData();
  }, []);

  useEffect(() => {
    console.log(role);
    if (role === "FACULTY") {
      const loadData = async () => {
        const data = await fetchUser();
        let filterData = data.filter((user) => user.role === "FACULTY");
        if (bran) {
          const fdata = filterData.filter((user) => user.branchId === bran.id);
          // console.log("fdata",fdata)
          setFacultyReportData(fdata);
        } else {
          setFacultyReportData(filterData);
        }
      };
      loadData();
    }

    if (role === "STAFF") {
      const loadData = async () => {
        const data = await fetchUser();
        const filterData = data.filter((user) => user.role === "STAFF");
        if (bran) {
          const fdata = filterData.filter((user) => user.branchId === bran.id);
          console.log("fdata", fdata);
          setStaffReportData(fdata);
        } else {
          setStaffReportData(filterData);
        }
      };
      loadData();
    }
  }, [role, bran]);

  const staffReportHeaders = [
    "id",
    "Staff Name",
    "Days Present",
    "Late Days",
    "Total Overtime (mins)",
    "Overtime Pay (₹)",
  ];

  return (
    <div className=" rounded h-[91%] bg-white m-2 overflow-hidden p-4">
      <div className="flex gap-4 border-b-2 pb-2">
        <p className="text-xl font-semibold">Filter: </p>
        <Select onValueChange={(v) => setRole(v)}>
          <SelectTrigger default={"FACULTY"} className={`w-45`}>
            <SelectValue placeholder={"Role"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={`FACULTY`}>Faculty</SelectItem>
            <SelectItem value={`STAFF`}>Staff</SelectItem>
          </SelectContent>
        </Select>

        {/* <Select onValueChange={(v)=>setBran(v)}>
          <SelectTrigger className={`w-45`}>
            <SelectValue placeholder={"Branch"} />
          </SelectTrigger>
          <SelectContent>
            {
              branch.map((item,i)=>(
                <SelectItem key={i} value={item.id}>{item.name}</SelectItem>

              ))
            }
            <SelectItem value={null}>None</SelectItem>
          </SelectContent>
        </Select> */}
        <Input type={`text`} value={bran.name} className={`w-44`} />
      </div>
      {role === "STAFF" && (
        <div className="w-full h-[94%] overflow-auto ">
          <ul className="grid grid-cols-[100px_250px_150px_150px_140px_140px] xl:grid-cols-6 px-4 py-3 xl:border-b border-gray-500 font-bold text-center">
            {staffReportHeaders.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {staffReportData.map((staff, index) => (
            <ul
              key={index}
              className="grid grid-cols-[100px_250px_150px_150px_140px_140px] xl:grid-cols-6 px-4 py-3 xl:border-b border-gray-500 text-center items-center hover:bg-gray-50"
            >
              <li className="font-semibold">{index + 1}</li>
              <li>{staff.name}</li>
              <li>{staff.staffAttendances.length}</li>
              <li>
                {staff.staffAttendances.filter((data) => data.isLate === true)
                  .length || 0}
              </li>
              <li>
                {staff.staffAttendances.reduce(
                  (count, overtime) => count + (overtime.overtimeMinutes || 0),
                  0
                ) || "-"}
              </li>
              <li className="text-green-600 font-semibold">
                ₹
                {staff.staffAttendances.reduce(
                  (count, overtime) => count + (overtime.overtimePay || 0),
                  0
                ) || "0"}
              </li>
            </ul>
          ))}
        </div>
      )}
      {role === "FACULTY" && (
        <div className="w-full h-[95%] overflow-auto">
          <ul className="grid grid-cols-[100px_250px_150px_150px_140px_140px_160px_140px] xl:grid-cols-8 px-4 py-3 xl:border-b border-gray-500 font-bold text-center">
            {facultyReportHeaders.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {facultyReportData.map((staff, index) => {
            const penalty = getFacultyPenaltyCount(staff)
            return (
              <ul
                key={index}
                className="grid grid-cols-[100px_250px_150px_150px_140px_140px_160px_140px] xl:grid-cols-8 px-4 py-3 xl:border-b border-gray-500 text-center items-center hover:bg-gray-50"
              >
                <li className="font-semibold">{index + 1}</li>
                <li>{staff.name}</li>
                <li>
                  {staff.lectures.reduce(
                    (count, lec) => count + (lec.attendance ? 1 : 0),
                    0
                  ) || 0}
                </li>
                <li>
                  {staff?.lectures.reduce(
                    (sum, lec) => sum + (lec?.TotalScheduled || 0),
                    0
                  ) -
                    staff.lectures.reduce(
                      (count, lec) => count + (lec.attendance ? 1 : 0),
                      0
                    ) || "-"}
                </li>
                <li>
                  {penalty.LATE_START || 0}
                </li>
                <li>
                  {penalty.EARLY_END || 0}
                </li>
                <li>
                  {penalty.BOTH || 0}
                </li>
                <li>
                  {
                    penalty.TOTAL || 0
                  }
                </li>
              </ul>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Report;

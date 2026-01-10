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

const Report = () => {
  const [role, setRole] = useState(null);
  const [branch, setBranch] = useState([]);
  const [bran,setBran] = useState(null)

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

  // const facultyReportData = [
  //   {
  //     facultyName: "Rahul Mehta",
  //     lecturesDone: 18,
  //     remainingLectures: 6,
  //     late: 2,
  //     early: 1,
  //     both: 0,
  //     totalPenalty: 3,
  //   },
  //   {
  //     facultyName: "Neha Sharma",
  //     lecturesDone: 20,
  //     remainingLectures: 2,
  //     late: 1,
  //     early: 0,
  //     both: 1,
  //     totalPenalty: 2,
  //   },
  //   {
  //     facultyName: "Ankit Verma",
  //     lecturesDone: 22,
  //     remainingLectures: 4,
  //     late: 3,
  //     early: 2,
  //     both: 1,
  //     totalPenalty: 6,
  //   },
  //   {
  //     facultyName: "Pooja Singh",
  //     lecturesDone: 15,
  //     remainingLectures: 5,
  //     late: 0,
  //     early: 1,
  //     both: 0,
  //     totalPenalty: 1,
  //   },
  // ];

  const [facultyReportData, setFacultyReportData] = useState([]);
  const [staffReportData, setStaffReportData] = useState([]);
  const { fetchUser,fetchBranch } = useManagement();

  useEffect(()=>{
    const loadData = async() =>{
      const branchdata = await fetchBranch();

      setBranch(branchdata)
    }
    loadData()
  },[])

  useEffect(() => {
    console.log(role);
    if (role === "FACULTY") {
      const loadData = async () => {
        const data = await fetchUser();
        let filterData = data.filter((user) => user.role === "FACULTY");
        if(bran){
          const fdata = filterData.filter((user) => user.branchId === bran)
          // console.log("fdata",fdata)
          setFacultyReportData(fdata);
          
        }else{
          setFacultyReportData(filterData);
        }
      };
      loadData();
    }

    if (role === "STAFF") {
      const loadData = async () => {
        const data = await fetchUser();
        const filterData = data.filter((user) => user.role === "STAFF");
        if(bran){
          const fdata = filterData.filter((user) => user.branchId === bran)
          console.log("fdata",fdata)
          setStaffReportData(fdata);
          
        }else{
          setStaffReportData(filterData);
        }
      };
      loadData();
    }
  }, [role,bran]);

  const staffReportHeaders = [
    "id",
    "Staff Name",
    "Days Present",
    "Late Days",
    "Total Overtime (mins)",
    "Overtime Pay (₹)",
  ];



  // const staffReportData = [
  //   {
  //     staffName: "Suresh Kumar",
  //     daysPresent: 22,
  //     daysAbsent: 2,
  //     lateDays: 3,
  //     totalOvertimeMinutes: 60,
  //     overtimePay: 100,
  //     totalPenalty: 3,
  //   },
  //   {
  //     staffName: "Anjali Patel",
  //     daysPresent: 24,
  //     daysAbsent: 0,
  //     lateDays: 1,
  //     totalOvertimeMinutes: 120,
  //     overtimePay: 200,
  //     totalPenalty: 1,
  //   },
  //   {
  //     staffName: "Ramesh Singh",
  //     daysPresent: 20,
  //     daysAbsent: 4,
  //     lateDays: 5,
  //     totalOvertimeMinutes: 30,
  //     overtimePay: 50,
  //     totalPenalty: 5,
  //   },
  // ];

  return (
    <div className=" rounded h-[91%] bg-white m-2 overflow-hidden p-4">
      <div className="flex gap-4 border-b-2 pb-2">
        <p className="text-xl font-semibold">Filter: </p>
        <Select onValueChange={(v) => setRole(v)}>
          <SelectTrigger className={`w-45`}>
            <SelectValue placeholder={"Role"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={`FACULTY`}>Faculty</SelectItem>
            <SelectItem value={`STAFF`}>Staff</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v)=>setBran(v)}>
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
        </Select>
      </div>
      {role === "STAFF" && (
        <div className="h-[92%] w-full overflow-auto xl:overflow-x-hidden">
          <ul className="grid grid-cols-[60px_180px_260px_220px_140px_140px] xl:grid-cols-6  px-4 py-3 xl:border-b border-gray-500 font-bold text-center">
            {staffReportHeaders.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {staffReportData.map((staff, index) => (
            <ul
              key={index}
              className="grid grid-cols-[60px_180px_260px_220px_140px_140px] xl:grid-cols-6 px-4 py-3 xl:border-b border-gray-500 text-center items-center hover:bg-gray-50"
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
        <div className=" h-[94%] w-full overflow-auto">
          <ul className="grid grid-cols-[60px_180px_260px_220px_140px_140px_120px_100px] xl:grid-cols-8  px-4 py-3 xl:border-b xl:border-gray-500 font-bold text-center">
            {facultyReportHeaders.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {facultyReportData.map((staff, index) => (
            <ul
              key={index}
              className="grid grid-cols-[60px_180px_260px_220px_140px_140px_120px_100px] xl:grid-cols-8 px-4 py-3 xl:border-b xl:border-gray-500 text-center items-center hover:bg-gray-50"
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
              <li>{staff.lectures.filter((lec)=>lec.attendance?.penalty === "LATE_START").length || 0}</li>
              <li>{staff.lectures.filter((lec)=>lec.attendance?.penalty === "EARLY_END").length || 0}</li>
              <li>{staff.lectures.filter((lec)=>lec.attendance?.penalty === "BOTH").length || 0}</li>
              <li>{staff.lectures.filter((lec)=>lec.attendance?.penalty !== "NONE").length}</li>
            </ul>
          ))}
        </div>
      )}
    </div>
  );
};

export default Report;

"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import ActionButton from "../superAdmin/ActionButton";
import { useManagement } from "@/context/ManagementContext";

const Faculty = () => {
  const getPenaltyCount = (user) => {
    const counts = {
      LATE_START: 0,
      EARLY_END: 0,
      BOTH: 0,
      TOTAL: 0,
    };

    user.lectures.forEach((lec) => {
      if (!Array.isArray(lec.attendance)) return;

      lec.attendance.forEach((att) => {
        if (!att.penalty || att.penalty === "NONE") return;

        counts[att.penalty]++;
        counts.TOTAL++;
      });
    });

    return counts;
  };

  const lists = [
    "Id",
    "Faculty Name",
    "Email",
    "Subjects",
    "Total Lectures",
    "Lectures Done",
    "Remaining",
    "Penalty Count",
  ];

  const [users, setUsers] = useState([]);

  const { fetchUser } = useManagement();
  const [penalty,setPenalty] = useState(null)

  useEffect(() => {
    const loaddata = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const branchId = user.data.user.branchId;
      console.log(branchId);

      const userDate = await fetchUser();

      const filterData = userDate
        .filter((user) => user.role === "FACULTY")
        .filter((user) => user.branchId === branchId);
      console.log(filterData);

      setUsers(filterData);
    };

    loaddata();
  }, []);

  return (
    <div className="h-[91%] bg-white m-2 rounded p-4 py-6 flex flex-wrap gap-5 flex-col items-center ">
      <div className="w-full h-full overflow-auto xl:overflow-x-hidden ">
        <ul className="grid grid-cols-[60px_180px_220px_200px_140px_140px_120px_140px] px-4 py-3 xl:border-b xl:border-gray-500 font-bold text-center">
          {lists.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        {users.map((user, index) => {
          const penalty = getPenaltyCount(user)
          return(
          <ul
            key={index}
            className="grid grid-cols-[60px_180px_220px_200px_140px_140px_120px_140px] px-4 py-3 xl:border-b xl:border-gray-500 text-center items-center text-wrap hover:bg-gray-50"
          >
            <li className="font-semibold">{index + 1}</li>
            <li>{user.name}</li>
            <li>{user.phoneNumber}</li>
            <li>
              {user.facultySubjects
                .map((item, i) => item.subject.name)
                .join(", ")}
            </li>
            <li>
              {user?.lectures.reduce(
                (sum, lec) => sum + (lec?.TotalScheduled || 0),
                0
              )}
            </li>
            <li>
              {user.lectures.reduce(
                (count, lec) => count + lec.attendance.length,
                0
              ) || 0}
            </li>
            <li>
              {user?.lectures.reduce(
                (sum, lec) => sum + (lec?.TotalScheduled || 0),
                0
              ) -
                user.lectures.reduce(
                  (count, lec) => count + (lec.attendance.length ? 1 : 0),
                  0
                ) || "-"}
            </li>
            <li>{penalty.TOTAL || "-"}</li>
          </ul>
        )})}
      </div>
    </div>
  );
};

export default Faculty;

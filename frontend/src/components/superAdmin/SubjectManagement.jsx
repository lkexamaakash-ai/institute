"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import ActionButton from "./ActionButton";
import SubjectModel from "./Models/SubjectModel";
import axios from "axios";
import { mainRoute } from "../apiroute";

const SubjectManagement = () => {
  const [open, setOpen] = useState(false);
  const [subjectData, setSubjectData] = useState([]);
  const [type, setType] = useState(false);
  const [subjec, setSubject] = useState({});

  //   const subjectData = [
  //   {
  //     sno: 1,
  //     subjectName: "Mathematics",
  //     subjectCode: "MTH101",
  //     assignedFaculty: ["Rahul Mehta", "Pooja Singh"],
  //     noOfLectures: 18,
  //     totalLectures: 24,
  //   },
  //   {
  //     sno: 2,
  //     subjectName: "Physics",
  //     subjectCode: "PHY102",
  //     assignedFaculty: ["Ankit Verma"],
  //     noOfLectures: 20,
  //     totalLectures: 26,
  //   },
  //   {
  //     sno: 3,
  //     subjectName: "Chemistry",
  //     subjectCode: "CHE103",
  //     assignedFaculty: ["Neha Sharma", "Amit Joshi"],
  //     noOfLectures: 15,
  //     totalLectures: 22,
  //   },
  //   {
  //     sno: 4,
  //     subjectName: "Computer Science",
  //     subjectCode: "CSE104",
  //     assignedFaculty: ["Rohit Kumar"],
  //     noOfLectures: 24,
  //     totalLectures: 30,
  //   },
  //   {
  //     sno: 5,
  //     subjectName: "English",
  //     subjectCode: "ENG105",
  //     assignedFaculty: ["Priya Nair"],
  //     noOfLectures: 21,
  //     totalLectures: 25,
  //   },
  // ];

  const lists = [
    "S.no",
    "Subject Name",
    "Batch",
    "Branch",
    "Assigned Faculty",
    "No of Lectures",
    "Total Lectures",
    "Actions",
  ];

  const fetchSubject = async () => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;
    const { data } = await axios.get(`${mainRoute}/api/subject`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data.data)
    setSubjectData(data.data);
  };
  useEffect(() => {

    fetchSubject();
  }, []);
  return (
    <>
      {/* <div className="h-full w-full p-4 py-6 flex flex-wrap gap-5 flex-col items-center "> */}
      <div className="h-[91%] bg-white m-2 rounded flex flex-col overflow-hidden gap-5 p-4 py-6 flex-wrap ">
        <div className="w-full flex items-center justify-end">
          <Button
            variant="secondary"
            className={`bg-green-600 text-gray-200 hover:bg-green-700 `}
            onClick={() => {
              setOpen(true);
              setType("create");
            }}
          >
            Add New Subject
          </Button>
        </div>
        <div className="w-full h-[91%]  overflow-auto">
          <ul className="grid grid-cols-[60px_120px_180px_260px_220px_140px_140px_120px_100px] xl:grid-cols-8 px-4 py-3 xl:border-b xl:border-gray-500 font-bold text-center">
            {lists.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {subjectData.length > 0 ? subjectData.map((sub, index) => (
            <ul
              key={index}
              className="grid grid-cols-[60px_120px_180px_260px_220px_140px_140px_120px_100px] xl:grid-cols-8 px-4 py-3 xl:border-b xl:border-gray-500 text-center items-center hover:bg-gray-50"
            >
              <li className="font-semibold">{index + 1}</li>
              <li>{sub.name}</li>
              <li>{sub.batch.name}</li>
              <li>{sub.batch.branch.name}</li>
              <li>
                {sub.facultySubjects.map((fs) => fs.faculty.name).join(",") || "-"}
              </li>
              <li>
                {sub?.batch.lectureSchedules.reduce(
                  (count, lec) => count + (lec.attendance ? 1 : 0),
                  0
                ) || "-"}
              </li>
              <li>
                {sub?.batch.lectureSchedules.reduce(
                  (sum, sublec) => sum + (sublec?.TotalScheduled || 0),
                  0
                ) || "-"}
              </li>
              <li className="flex justify-center">
                <ActionButton
                  user={sub}
                  edit={false}
                  // needed={true}
                  setOp={setOpen}
                  setUs={setSubject}
                  setType={setType}
                />
              </li>
            </ul>
          )):  <p className="text-center my-5 text-xl">No Subjects</p>}
        </div>
      </div>
      <SubjectModel
        subject={subjec}
        open={open}
        setOpen={setOpen}
        type={type}
        refetch={fetchSubject}
      />
    </>
  );
};

export default SubjectManagement;

"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import BranchModels from "./Models/BranchModels";
import axios from "axios";
import { mainRoute } from "../apiroute";

const BranchManagement = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [bran, setBran] = useState({});
  const [badmin, setBadmin] = useState("");

  const lists = [
    "S.no",
    "Branch Name",
    "Total Faculties",
    "Total Staff",
    "Branch Admin",
    "Assign",
    "Edit",
    "Delete",
  ];

  // const branches = [
  //   {
  //     id: 1,
  //     branchName: "Delhi",
  //     totalFaculties: 25,
  //     totalStaff: 50,
  //     branchAdmin: "Navneet Shahi",
  //   },
  //   {
  //     id: 2,
  //     branchName: "Mumbai",
  //     totalFaculties: 30,
  //     totalStaff: 62,
  //     branchAdmin: "Rohit Verma",
  //   },
  //   {
  //     id: 3,
  //     branchName: "Bangalore",
  //     totalFaculties: 28,
  //     totalStaff: 55,
  //     branchAdmin: "Ananya Singh",
  //   },
  //   {
  //     id: 4,
  //     branchName: "Hyderabad",
  //     totalFaculties: 22,
  //     totalStaff: 48,
  //     branchAdmin: "Amit Patel",
  //   },
  //   {
  //     id: 5,
  //     branchName: "Pune",
  //     totalFaculties: 20,
  //     totalStaff: 42,
  //     branchAdmin: "Sneha Kulkarni",
  //   },
  // ];

  const [branches, setBranches] = useState([]);

  const fetchBranches = async () => {
    const tok = JSON.parse(localStorage.getItem("user"));
    const token = tok.data.token;
    const { data } = await axios.get(`${mainRoute}/api/branch`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    setBranches(data.data);
  };
  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <>
      {/* <div className="h-full w-full p-4 py-6 flex flex-wrap gap-5 flex-col items-center "> */}
      <div className="h-full bg-white m-2 rounded flex flex-col items-center p-4 py-6 overflow-hidden">
        <div className="w-full flex items-center justify-end">
          <Button
            variant="secondary"
            className={`bg-green-600 text-gray-200 hover:bg-green-700 `}
            onClick={() => {
              setOpen(true);
              setType("add");
            }}
          >
            Add Branch
          </Button>
        </div>
        <div className="w-full">
          <ul className="grid grid-cols-8 xl:px-4 text-sm py-3 border-b border-gray-500 font-bold text-center">
            {lists.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {branches.length > 0 ? (
            branches.map((branche, index) => {
              const branchAdmin = branche?.users?.find(
                (user) => user.role === "BRANCH_ADMIN"
              );

              return (
                <ul
                  key={branche.id}
                  className="grid grid-cols-8 text-sm xl:text-[1rem] px-4 py-3 border-b border-gray-500 text-center items-center hover:bg-gray-100"
                >
                  <li className="font-semibold">{index + 1}</li>
                  <li>{branche.name}</li>

                  <li>
                    {branche.users.filter((u) => u.role === "FACULTY").length}
                  </li>

                  <li>
                    {branche.users.filter((u) => u.role === "STAFF").length}
                  </li>

                  <li>{branchAdmin ? branchAdmin.name : "-"}</li>

                  <li>
                    <Button
                      size="sm"
                      onClick={() => {
                        setOpen(true);
                        setType("assign");
                        setBran(branche);
                      }}
                      className={`scale-[0.6] xl:scale-[1]`}
                    >
                      Assign
                    </Button>
                  </li>

                  <li>
                    <Button
                      onClick={() => {
                        setType("edit");
                        setBran(branche);
                        setOpen(true);
                        setBadmin(branchAdmin);
                      }}
                      size="sm"
                      variant="secondary"
                      className={`scale-[0.6] xl:scale-[1]`}
                    >
                      Edit
                    </Button>
                  </li>

                  <li>
                    <Button
                      onClick={() => {
                        setType("delete");
                        setBran(branche);
                        setOpen(true);
                        setBadmin(branchAdmin);
                      }}
                      size="sm"
                      variant="destructive"
                      className={`scale-[0.6] xl:scale-[1]`}
                    >
                      Delete
                    </Button>
                  </li>
                </ul>
              );
            })
          ) : (
            <p className="text-center my-5 text-xl">No Branches</p>
          )}
        </div>
      </div>

      <BranchModels
        open={open}
        refetch={fetchBranches}
        setOpen={setOpen}
        type={type}
        branch={bran}
        badmin={badmin}
      />
    </>
  );
};

export default BranchManagement;

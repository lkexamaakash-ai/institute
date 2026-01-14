import React, { useEffect, useState } from "react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import axios from "axios";
import { mainRoute } from "../../apiroute";
import { read } from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
// import { useManagement } from "@/context/ManagementContext";

const UploadFileStaff = ({ open, setOpen, refetch }) => {
  const [isLoad, setIsLoad] = useState(false);
  const [file, setFile] = useState(null);
  const [sheetNumber, setSheetNumber] = useState(0);
  const [sheetCounts, setSheetCount] = useState(0);

  const countSheetNumber = async (file) => {
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), {
      type: "array",
    });

    const sheetCount = workbook.SheetNames.length;
    setSheetNumber(sheetCount);
  };

  const uploadExcel = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setIsLoad(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sheetNumber", sheetCounts);

    const token = JSON.parse(localStorage.getItem("user")).data.token;

    const { data } = await axios.post(
      `${mainRoute}/api/uploadStaff`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ Content-Type mat set karna
        },
      }
    );
    console.log(data.data)
    setIsLoad(false);
    await refetch();
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div className="h-screen w-full bg-[#d8d3d382] absolute top-0 left-0 flex justify-center items-center">
          <div className="h-[80vh] p-5 xl:w-[40vw] w-[90%] bg-white shadow-2xl rounded-2xl overflow-hidden ">
            <div className="flex justify-end px-5">
              <span
                className="cursor-pointer font-bold"
                onClick={() => setOpen(false)}
              >
                x
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold mb-2">
                Add Staff Historical Data
              </h1>
            </div>
            <div className="h-[91%] bg-white m-2 rounded flex flex-col gap-5 p-4 py-6">
              <Label>Upload File</Label>

              <Input
                type="file"
                accept=".xlsx"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  countSheetNumber(e.target.files[0]);
                }}
              />

              <Select onValueChange={(v) => setSheetCount(v)}>
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder={`Sheet Name`} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: sheetNumber }).map((_, i) => (
                    <SelectItem value={i} key={i}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button disabled={isLoad} onClick={uploadExcel}>
                {isLoad ? "Loading..." : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadFileStaff;

import { mainRoute } from "@/components/apiroute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useManagement } from "@/context/ManagementContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const StaffModal = ({ open, setOpen }) => {
  const [bra, setBra] = useState([]);
  const [users, setUsers] = useState([]);

  const { fetchUser, fetchBranch } = useManagement();
  const [selectBranch, setSelectBranch] = useState(null);
  const [selectUser, setSelectUser] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [actualinTime, setActualInTime] = useState(null);
  const [actualoutTime, setActualOutTime] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const branchData = await fetchBranch();

      setBra(branchData);
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const userData = await fetchUser();
      const filterUser = userData
        .filter((user) => user.branchId === selectBranch)
        .filter((user) => user.role === "STAFF");
      console.log(filterUser);
      setUsers(filterUser);
    };
    loadData();
  }, [selectBranch]);

  useEffect(() => {
    const findUser = users.filter((user) => user.id === selectUser)[0];

    setStartTime(findUser?.shiftStartTime);
    setEndTime(findUser?.shiftEndTime);
  }, [selectUser]);

  const formatTime = (isoTime) => {
    return new Date(isoTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const [staffPreview, setStaffPreview] = useState(null);

  const THIRTY_MIN = 30 * 60 * 1000;

  const calculateStaffAttendanceUI = ({
    shiftStart,
    shiftEnd,
    actualIn,
    actualOut,
  }) => {
    let isLate = false;
    let overtimeMinutes = 0;
    let overtimePay = 0;
    let message = "On time";
    let lateMinutes = 0;

    if (actualIn > shiftStart) {
      lateMinutes = Math.floor((actualIn - shiftStart) / (60 * 1000));

      if (actualIn - shiftStart > THIRTY_MIN) {
        isLate = true;
        message = "Late Arrival";
      }
    }

    if (actualOut && actualOut > shiftEnd) {
      overtimeMinutes = Math.floor((actualOut - shiftEnd) / THIRTY_MIN) * 30;

      overtimePay = (overtimeMinutes / 30) * 50;

      if (overtimePay > 0) {
        message = "Overtime Worked";
      }
    }

    return {
      isLate,
      overtimeMinutes,
      overtimePay,
      message,
      lateMinutes,
    };
  };

  useEffect(() => {
    if (!startTime || !endTime || !actualinTime || !actualoutTime) return;
    const start = startTime.split("T")[0];
    const end = endTime.split("T")[0];

    const result = calculateStaffAttendanceUI({
      shiftStart: new Date(startTime),
      shiftEnd: new Date(endTime),
      actualIn: new Date(`${start}T${actualinTime}`),
      actualOut: actualoutTime ? new Date(`${end}T${actualoutTime}`) : null,
    });

    setStaffPreview(result);
  }, [startTime, endTime, actualinTime, actualoutTime]);

  const router = useRouter();

  const markStaffAttendance = async () => {
    try {
      let tokn = JSON.parse(localStorage.getItem("user"));
      let token = tokn.data.token;

      const start = startTime.split("T")[0];
      const end = endTime.split("T")[0];

      const { data } = await axios.post(
        `${mainRoute}/api/staffAttendance`,
        {
          staffId: selectUser,
          branchId: selectBranch,
          shiftStartTime: startTime,
          shiftEndTime: endTime,
          actualInTime: `${start}T${actualinTime}`,
          actualOutTime: `${end}T${actualoutTime}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Attendance Marked Successfully");

      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error("Error in marking attendance");
      setOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      {open && (
        <div className="h-screen w-full bg-[#d8d3d382] absolute top-0 left-0 flex justify-center items-center overflow-hidden">
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
              <h1 className="text-xl font-semibold mb-2">Staff Attendance</h1>
            </div>

            <div className="flex h-[90%] flex-col gap-5 [&>div]:flex [&>div]:flex-col [&>div]:gap-2 overflow-y-auto overflow-x-hidden">
              <div>
                <Label>Branch</Label>
                <Select onValueChange={(v) => setSelectBranch(v)}>
                  <SelectTrigger className={`w-full`}>
                    <SelectValue placeholder={`Branch`} />
                  </SelectTrigger>
                  <SelectContent>
                    {bra.map((item, i) => (
                      <SelectItem key={i} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Staff Name</Label>
                <Select onValueChange={(v) => setSelectUser(v)}>
                  <SelectTrigger className={`w-full`}>
                    <SelectValue placeholder={`Staff Name`} />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value={"Navneet"}>Navneet</SelectItem>
                    <SelectItem value={"Navneet"}>Saksham</SelectItem>
                    <SelectItem value={"Navneet"}>Soni </SelectItem> */}
                    {users.map((item, i) => (
                      <SelectItem key={i} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div>
                  <Label>Shift In Time</Label>
                  <Input type={`text`} readOnly value={formatTime(startTime)} />
                </div>
                <div>
                  <Label>Shift Out Time</Label>
                  <Input type={`text`} readOnly value={formatTime(endTime)} />
                </div>
              </div>

              <div>
                <div>
                  <Label>In Time</Label>
                  <Input
                    type={`time`}
                    onChange={(e) => setActualInTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Out Time</Label>
                  <Input
                    type={`time`}
                    onChange={(e) => setActualOutTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Late Entry</Label>
                <Input
                  type={`text`}
                  value={(staffPreview?.isLate ? "Yes" : "No") || "No"}
                  placeholder={`Yes/No`}
                  readOnly
                />
              </div>

              <div>
                <Label>Late Duration(mins)</Label>
                <Input
                  type={`text`}
                  placeholder={`40mins`}
                  readOnly
                  value={staffPreview?.lateMinutes || 0}
                />
              </div>

              <div>
                <Label>Overtime Duration(mins)</Label>
                <Input
                  type={`text`}
                  placeholder={`70mins`}
                  readOnly
                  value={staffPreview?.overtimeMinutes || 0}
                />
              </div>

              <div>
                <Label>Overtime Pay</Label>
                <Input
                  type={`text`}
                  placeholder={`100`}
                  value={staffPreview?.overtimePay || 0}
                  readOnly
                />
              </div>

              <div className="flex-row! w-full [&>Button]:cursor-pointer">
                <Button
                  onClick={() => {
                    setOpen(false);
                  }}
                  className={`w-1/2`}
                >
                  Cancel
                </Button>
                <Button onClick={markStaffAttendance} className={`w-1/2`}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffModal;

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

const FacultyModal = ({ open, setOpen }) => {
  const router = useRouter();
  const [batch, setBatch] = useState([]);
  const [bra, setBra] = useState([]);
  const [users, setUsers] = useState([]);
  const [lec, setLec] = useState([]);

  const [us, setUs] = useState({});

  const [status, setStatus] = useState(null);
  const [payout, setPayout] = useState(0);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectLecture, setSelectedLecture] = useState(null);
  const [lecture, setLecture] = useState({});
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [filteredSubject, setFilteredSubject] = useState([]);
  const [filteredLecture, setFilteredLecture] = useState([]);

  const [selectFaculty, setSelectFaulty] = useState(null);

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [inTime, setIntime] = useState(null);
  const [outTime, setOuttime] = useState(null);

  const { fetchBranch, fetchUser, fetchSubject, fetchLecture } =
    useManagement();

  const formatTime = (isoTime) => {
    return new Date(isoTime).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const loadBranch = async () => {
      const branchData = await fetchBranch();

      setBra(branchData);
    };

    loadBranch();
  }, []);

  useEffect(() => {
    let tok = JSON.parse(localStorage.getItem("user"));
    let token = tok.data.token;
    const fetchBatch = async () => {
      const { data } = await axios.get(`${mainRoute}/api/batch`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const filtereddata = data.data.filter(
        (batch) => batch.branchId === selectedBranch
      );
      // console.log(filtereddata);
      setBatch(filtereddata);
    };

    fetchBatch();
  }, [selectedBranch]);

  useEffect(() => {
    const loadData = async () => {
      const userData = await fetchUser();
      const facultyOnly = userData.filter((user) => user.role === "FACULTY");
      console.log(facultyOnly);
      setUsers(facultyOnly);
      setFilteredFaculty(facultyOnly);
    };
    loadData();
  }, [selectedBatch]);

  useEffect(() => {
    if (!selectedBranch) {
      setFilteredFaculty(users);
      return;
    }

    const branchWiseFaculty = users.filter(
      (user) => user.branchId === Number(selectedBranch)
    );

    setFilteredFaculty(branchWiseFaculty);
  }, [selectedBranch, users]);

  useEffect(() => {
    if (!selectFaculty) {
      setFilteredLecture(lec);
      return;
    }

    const lectureWiseFilter = lec.filter(
      (user) => user.faculty.id === Number(selectFaculty)
    );

    setFilteredLecture(lectureWiseFilter);
  }, [selectFaculty, lec]);

  useEffect(() => {
    const load = async () => {
      const subjectData = await fetchLecture();
      const filterSub = subjectData
        .filter((sub) => sub.batchId === selectedBatch)
        .filter((sub) => sub.facultyId === selectFaculty);
      setLec(filterSub);
    };
    load();
  }, [selectFaculty, selectedBatch]);

  const settingpayout = async () => {
    const userdata = await fetchUser();

    const filterdata = userdata.find((user) => user.id === selectFaculty);

    if (status === "CONDUCTED") {
      setPayout(filterdata.salary);
    }
    if (status === "CANCELLED") {
      setPayout(filterdata.salary / 2);
    }
    if (status === "MISSED") {
      setPayout(0);
    }
  };

  useEffect(() => {
    settingpayout();
  }, [status]);

  useEffect(() => {
    setSelectedLecture(lecture.id);
    const startTime = lecture.startTime;
    const endTime = lecture.endTime;
    setStartTime(formatTime(startTime));
    setEndTime(formatTime(endTime));
  }, [lecture]);

  const toTimeInput = (iso) => new Date(iso).toISOString().substring(11, 16);

  const [penalty, setPenalty] = useState(0);

  const FIFTEEN_MIN = 15 * 60 * 1000;

  const calculateFacultyPenaltyUI = ({
    plannedStart,
    plannedEnd,
    actualStart,
    actualEnd,
    // isCancelledNoStudents,
    lectureAmount,
  }) => {
    // if (isCancelledNoStudents) {
    //   return {
    //     penalty: "NONE",
    //     payableAmount: lectureAmount / 2,
    //     message: "Lecture cancelled (No Students) – 50% Pay",
    //   };
    // }

    let isLate = false;
    let isEarly = false;

    if (actualStart - plannedStart > FIFTEEN_MIN) {
      isLate = true;
    }

    if (plannedEnd - actualEnd > FIFTEEN_MIN) {
      isEarly = true;
    }

    let penalty = "NONE";

    if (isLate && isEarly) penalty = "BOTH";
    else if (isLate) penalty = "LATE_START";
    else if (isEarly) penalty = "EARLY_END";

    return {
      penalty,
      payableAmount: lectureAmount,
      message:
        penalty === "NONE"
          ? "No Penalty"
          : penalty === "LATE_START"
          ? "Late Start Penalty"
          : penalty === "EARLY_END"
          ? "Early End Penalty"
          : "Late Start + Early End Penalty",
    };
  };

  const [cancelled, setCancelled] = useState(false);

  const [penaltyPreview, setPenaltyPreview] = useState(null);

  const lectureAmount = 500;

  useEffect(() => {
    if (!lecture.startTime || !lecture.endTime || !inTime || !outTime) return;
    const start = lecture.startTime.split("T")[0];
    const end = lecture.endTime.split("T")[0];

    const result = calculateFacultyPenaltyUI({
      plannedStart: new Date(lecture.startTime),
      plannedEnd: new Date(lecture.endTime),
      actualStart: new Date(`${start}T${inTime}`),
      actualEnd: new Date(`${end}T${outTime}`),
      // isCancelledNoStudents: cancelled,
      lectureAmount,
    });

    setPenaltyPreview(result);
  }, [startTime, endTime, inTime, outTime, cancelled]);

  const markAttendance = async () => {
    try {
      let tokn = JSON.parse(localStorage.getItem("user"));
      let token = tokn.data.token;
      let today = new Date().toISOString().split("T")[0];

      if (status === "CANCELLED") setPayout(payout / 2);
      if (status === "MISSED") setPayout(0);
      const { data } = await axios.post(
        `${mainRoute}/api/attendance/lecture/attendance`,
        {
          lectureId: lecture.id,
          actualStartTime: `${today}T${inTime}`,
          actualEndTime: `${today}T${outTime}`,
          status: status,
          payout: payout,
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
              <h1 className="text-xl font-semibold mb-2">Faculty Attendance</h1>
            </div>

            <div className="flex h-[90%] flex-col gap-5 [&>div]:flex [&>div]:flex-col [&>div]:gap-2 overflow-y-auto overflow-x-hidden">
              <div>
                <Label>Branch</Label>
                <Select onValueChange={(v) => setSelectedBranch(v)}>
                  <SelectTrigger className={`w-full`}>
                    <SelectValue placeholder={`Branch Name`} />
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
                <Label>Batch</Label>
                <Select onValueChange={(v) => setSelectedBatch(v)}>
                  <SelectTrigger className={`w-full`}>
                    <SelectValue placeholder={`Batch Name`} />
                  </SelectTrigger>
                  <SelectContent>
                    {batch.map((item, i) => (
                      <SelectItem key={i} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="">
                <Label>Faculty Name</Label>
                <Select onValueChange={(v) => setSelectFaulty(v)}>
                  <SelectTrigger className={`w-full`}>
                    <SelectValue placeholder={`Faculty Name`} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredFaculty.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">
                        No faculty found for this branch
                      </div>
                    ) : (
                      filteredFaculty.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subject</Label>
                <Select onValueChange={(v) => setLecture(v)}>
                  <SelectTrigger className={`w-full`}>
                    <SelectValue placeholder={`Subject Name`} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLecture.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">
                        No faculty found for this branch
                      </div>
                    ) : (
                      filteredLecture.map((item, i) => (
                        <SelectItem key={i} value={item}>
                          {item.subject.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select onValueChange={(v) => setStatus(v)}>
                  <SelectTrigger className={`w-full`}>
                    <SelectValue placeholder={`Status`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={`CONDUCTED`}>Conducted</SelectItem>
                    <SelectItem value={`CANCELLED`}>Cancelled</SelectItem>
                    <SelectItem value={`MISSED`}>Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payout</Label>
                <Input
                  value={payout}
                  readOnly
                  placeholder={`Payout`}
                  onChange={(e) => setPayout(e.target.value)}
                />
              </div>

              <div>
                <Label>Planned Time</Label>
                {/* <input type="time" value="10:30" readOnly />  */}
                <Input
                  type={`text`}
                  readOnly
                  className={`uppercase`}
                  value={`${startTime || "00:00"} - ${endTime || "00:00"}`}
                />
              </div>

              <div>
                <div>
                  <Label>In Time</Label>
                  <Input
                    type={`time`}
                    onChange={(e) => setIntime(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Out Time</Label>
                  <Input
                    type={`time`}
                    onChange={(e) => setOuttime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Penalty</Label>
                <Input
                  type={`text`}
                  placeholder={`Penalty`}
                  value={penaltyPreview?.message || "0"}
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
                <Button onClick={markAttendance} className={`w-1/2`}>
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

export default FacultyModal;

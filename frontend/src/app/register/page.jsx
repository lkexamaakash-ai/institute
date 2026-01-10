"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { mainRoute } from "@/components/apiroute";

const Register = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleRegister = async () => {
    try {
      const { data } = await axios.post(
        `${mainRoute}/api/auth/register_super`,
        {
          name,
          phoneNumber,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("user", JSON.stringify(data));

      router.push("/");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <>
      <div className="h-screen w-full relative bg-gray-100 lg:bg-[url('/bg2.png')] bg-cover bg-center flex justify-center items-center ">
        <div className="absolute m-2 rounded-2xl lg:right-0 bg-white min-h-[60%] w-[90%] lg:h-[95%] lg:w-[40%] shadow-2xl flex flex-col items-center py-10">
          <div className="">
            <img src="/header.jpg" alt="" className="h-20 " />
          </div>
          <div className=" flex flex-col gap-3 w-[90%] mt-10 ">
            <h1 className="text-center text-3xl mb-10 font-semibold">
              Create account
            </h1>

            <Input
              type={"text"}
              placeholder={"Enter Your Name"}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              type={"text"}
              placeholder={"Enter Your Phone Number"}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Input
              type={"password"}
              placeholder={"Enter Your Password"}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              onClick={handleRegister}
              variant="secondary"
              className={"cursor-pointer my-10"}
            >
              Submit
            </Button>
          </div>
          <div>
            <p className="text-sm">
              This is to register Super admin to manage the website
            </p>
          </div>
          <div className="mt-2">
            <p className="text-sm">
              Have an Account{" "}
              <span
                onClick={() => router.push("/login")}
                className="text-blue-500 cursor-pointer font-semibold"
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;

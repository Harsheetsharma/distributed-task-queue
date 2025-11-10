"use client";
import { useEffect, useState } from "react";
import prisma from "../../../../../packages/db/index";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { JobsId } from "../../../../../packages/store/src/id";
import { useRecoilValue } from "recoil";
export default function () {
  const searchParams = useSearchParams();
  const Jobid = useRecoilValue(JobsId);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!Jobid) return;
    const fetchJob = async () => {
      const response = await axios.get(`http://localhost:4000/jobs/${Jobid}`);
      setStatus(response.data.status);
    };
    fetchJob();
  }, [Jobid]);

  return (
    <div>
      <div className="text-3xl text-black ">all jobs here!</div>
      <div className=" ms-10 mt-4 h-60 p-4 border-2 items-start rounded shadow-md w-1/4 flex justify-between">
        <div>Name of job</div>
        <div>Status {status}</div>
      </div>
    </div>
  );
}

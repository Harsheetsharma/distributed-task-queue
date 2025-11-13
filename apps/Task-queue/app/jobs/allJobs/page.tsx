"use client";
import { useEffect, useState } from "react";
import prisma from "../../../../../packages/db/index";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { JobsId } from "../../../../../packages/store/dist/id";
import { useRecoilValue } from "recoil";
export default function () {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const Jobid = useRecoilValue(JobsId);
  const [status, setStatus] = useState("");
  console.log(Jobid);
  useEffect(() => {
    if (!Jobid) return;
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/jobs/${Jobid}`);
        setStatus(response.data.status);
      } catch (err) {
        console.error("Failed to fetch job status:", err);
      }
    };

    // Fetch immediately
    fetchJob();

    // Then fetch every 2 seconds (2000 ms)

    if (status !== "SUCCESS") {
      var interval = setInterval(fetchJob, 2000);
    }
    // Cleanup on unmount
    return () => clearInterval(interval);
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

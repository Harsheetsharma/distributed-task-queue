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
  const [type, setType] = useState("");
  console.log(Jobid);
  useEffect(() => {
    if (!Jobid && jobId) return;

    let interval: NodeJS.Timeout | null = null;
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/jobs/${jobId}`);
        setStatus(response.data.status);
        setType(response?.data?.type);
      } catch (err) {
        console.error("Failed to fetch job status:", err);
      }
    };

    // Fetch immediately
    fetchJob();

    // Then fetch every 2 seconds (2000 ms)

    if (status !== "SUCCESS") {
      interval = setInterval(fetchJob, 2000);
    }
    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [Jobid, status]);

  return (
    <div>
      <div className="text-2xl sm:text-3xl text-black">all jobs here!</div>

      <div
        className="ms-0 sm:ms-10 mt-4 h-auto sm:h-60 p-4 
            border-2 rounded shadow-md 
            w-full sm:w-1/2 lg:w-1/4"
      >
        <div className="flex justify-between w-full text-sm sm:text-base">
          <div className="ps-2">Job</div>
          <div className="pe-2">Status</div>
        </div>

        <div className="h-[0.5px] w-full bg-gray-700 my-2"></div>

        <div className="flex justify-between text-sm sm:text-base">
          <div>{type.toUpperCase()}</div>
          <div
            className={status === "SUCCESS" ? "text-green-600" : "text-red-500"}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
}

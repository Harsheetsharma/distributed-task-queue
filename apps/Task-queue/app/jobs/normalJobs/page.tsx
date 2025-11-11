"use client";
import { useEffect, useState } from "react";
// import prisma from "../../../../../packages/db/index";
import axios from "axios";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { JobsId } from "../../../../../packages/store/src/id";
import { useRecoilState, useSetRecoilState } from "recoil";
// import { getRecoil } from "recoil";
// import { recoilVersion } from "recoil";

export default function () {
  const router = useRouter();
  const setStatus = useSetRecoilState(JobsId);
  const [triggerHover, setTringgerHover] = useState(false);
  const [jobName, setJobName] = useState("");
  const [jobType, setJobType] = useState("");
  const [payload, setPayload] = useState("");
  const [runAfter, setRunAfter] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(0);
  async function sendJobRequest() {
    event?.preventDefault();
    const response = await axios.post("http://localhost:4000/normalJobs", {
      type: jobType,
      payload: payload,
      runAfter: runAfter,
      maxAttempts,
    });

    if (!response) {
      console.log("could not sent the request!");
    }
    // alert("your jobs is created!");
    console.log(response);
    setStatus(response.data.id);
    router.push("/allJobs");
  }

  useEffect(() => {});

  function createForm() {
    console.log("inside createForm");
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Create New Job
            </h2>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                setTringgerHover(false);
              }}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={sendJobRequest} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Name
              </label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <input
                type="text"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job type"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payload
              </label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter payload (JSON format)"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Run After
              </label>
              <input
                type="text"
                value={runAfter}
                onChange={(e) => setRunAfter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="When to run"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attempts
              </label>
              <input
                type="string"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Maximum attempts"
                min="1"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {triggerHover ? (
        createForm()
      ) : (
        <div>
          createJob{" "}
          <button
            onClick={() => {
              setTringgerHover(true);
            }}
          >
            Now!
          </button>
        </div>
      )}
    </div>
  );
}

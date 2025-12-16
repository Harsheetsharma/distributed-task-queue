"use client";
import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

export default function Home() {
  const router = useRouter();
  return (
    <div>
      Hello
      <button
        className="px-4 py-2 font-medium border-2 border-black shadow-lg ms-2 "
        onClick={() => {
          router.push("/jobs/normalJobs");
        }}
      >
        Jobs Portal!
      </button>
    </div>
  );
}

import type { Metadata } from "next";
import { PostsIndex } from "@/components/PostsIndex";

export const metadata: Metadata = {
  title: "All writing",
  description: "Every post, newest first.",
  alternates: { canonical: "/posts/" },
};

export default function Posts() {
  return <PostsIndex page={1} />;
}

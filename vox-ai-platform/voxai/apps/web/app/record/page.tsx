import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RecordingStudio } from "@/components/recording/RecordingStudio";

export const metadata = {
  title: "Record — VOX AI",
  description: "Record your voice for AI vocal analysis",
};

export default async function RecordPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin?callbackUrl=/record");

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <RecordingStudio />
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/build"); // oder eine andere Standardseite
  }, [router]);

  return null;
}

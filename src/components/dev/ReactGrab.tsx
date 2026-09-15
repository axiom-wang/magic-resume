import { useEffect } from "react";

export function ReactGrab() {
  useEffect(() => {
    const isSnapshotMode =
      new URLSearchParams(window.location.search).get("snapshot") === "1";

    if (import.meta.env.DEV && !isSnapshotMode) {
      void import("react-grab");
    }
  }, []);

  return null;
}

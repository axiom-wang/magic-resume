import { createFileRoute } from "@tanstack/react-router";
import IframeResumeExportViewer from "../../components/preview/IframeResumeExportViewer";

export const Route = createFileRoute("/app/preview-resume")({
  ssr: false,
  component: IframeResumeExportViewer,
});

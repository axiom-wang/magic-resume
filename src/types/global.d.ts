declare global {
  interface Window {
    showDirectoryPicker(
      options?: FilePickerOptions
    ): Promise<FileSystemDirectoryHandle>;
    /** Injected by scripts/export-resume-pdf.ts for headless render */
    __MAGIC_RESUME_DATA__?: import("@/types/resume").ResumeData;
  }
}

interface FilePickerOptions {
  multiple?: boolean;
  mode?: "read" | "readwrite";
}

export {};

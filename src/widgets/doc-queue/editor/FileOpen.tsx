import { FilePreview } from "@/shared/ui/preview";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Full-screen preview of one API file (the draft .docx); renders nothing without a path.
export function FileOpen({ visible, onClose, path, name }: { visible: boolean; onClose: () => void; path: string; name: string }) {
  return path ? <FilePreview visible={visible} onClose={onClose} file={{ path, name, mime: DOCX }} /> : null;
}

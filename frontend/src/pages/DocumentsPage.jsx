/**
 * เอกสาร: grid of documents grouped by docType, with upload and download.
 * Needs GET/POST /documents plus the Cloudinary upload preset. Sprint 6.
 */

import { ComingSoon } from "@/components/common/ComingSoon";
import { PageHeader } from "@/components/common/PageHeader";
import { FileText } from "lucide-react";

export function DocumentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="เอกสาร" subtitle="แบบก่อสร้าง สัญญา BOQ และรูปถ่ายหน้างาน" />
      <ComingSoon icon={FileText} title="เอกสาร" sprint="6 (Money & docs)" />
    </div>
  );
}

export default DocumentsPage;

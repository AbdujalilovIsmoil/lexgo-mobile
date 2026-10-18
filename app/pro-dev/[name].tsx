import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import ProCasePage from "@/pages/pro-case/ProCasePage";
import ProCasesPage from "@/pages/pro-cases/ProCasesPage";
import ProFilesPage from "@/pages/pro-files/ProFilesPage";
import ProReferralsPage from "@/pages/pro-referrals/ProReferralsPage";
import ProStatsPage from "@/pages/pro-stats/ProStatsPage";
import { ClientsPage } from "@/pages/clients/ClientsPage";
import { RequestsPage } from "@/pages/requests/RequestsPage";
import { WorkspacePage } from "@/pages/workspace/WorkspacePage";
import * as a from "@/zz-adv2-dev/fx1";
import * as b from "@/zz-adv2-dev/fx2";

// TEMPORARY: ungated pages with seeded query data (seller endpoints need an OTP-only account).
export default function Dev() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const qc = useQueryClient();
  useState(() => {
    qc.setQueryData(["pro-workspace", "cabinet"], a.cabinet);
    qc.setQueryData(["pro-workspace", "stats"], a.stats);
    qc.setQueryData(["pro-workspace", "unread"], 3);
    qc.setQueryData(["pro-workspace", "onboarding"], { done: 4, total: 5, status: "draft" });
    for (const k of Object.keys(a.reqs)) qc.setQueryData(["pro-requests", k], (a.reqs as Record<string, unknown>)[k]);
    qc.setQueryData(["pro-cases", "list"], a.cases);
    qc.setQueryData(["pro-cases", "one", "c1"], a.cases[0]);
    qc.setQueryData(["pro-cases", "timeline", "c1"], b.timeline);
    qc.setQueryData(["pro-cases", "docs", "c1"], [{ id: "x", workId: "DOC-1", title: "Da'vo arizasi loyihasi", status: "active", caseId: "c1", createdAt: "" }]);
    qc.setQueryData(["pro-cases", "room", "c1"], "room1");
    qc.setQueryData(["pro-clients", "list"], a.clients);
    qc.setQueryData(["pro-clients", "one", "cl1"], a.detail);
    qc.setQueryData(["pro-files", "tree", ""], b.tree);
    qc.setQueryData(["pro-files", "tree", "c1"], b.tree);
    qc.setQueryData(["pro-files", "limits"], b.limits);
    qc.setQueryData(["pro-files", "requests"], b.docReqs);
    return 1;
  });
  const pages: Record<string, React.ReactElement> = { ws: <WorkspacePage />, req: <RequestsPage />, cli: <ClientsPage />, cases: <ProCasesPage />, case: <ProCasePage />, files: <ProFilesPage />, stats: <ProStatsPage />, ref: <ProReferralsPage /> };
  return pages[name ?? "ws"] ?? pages.ws;
}

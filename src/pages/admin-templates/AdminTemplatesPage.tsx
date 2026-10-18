import { useMemo, useState } from "react";
import { filterTemplates, TemplateRow, useTemplates, type Template } from "@/entities/admin-templates";
import { TemplateFormSheet, TemplateImportSheet, useSheetTarget } from "@/features/admin-templates";
import { TemplatesHeader, useTemplateActions } from "@/widgets/admin-templates";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { ExportButton } from "@/features/admin-export";

const STEP = 30;

// Document templates: hero, search and live/draft/category tiles, ticket per template (publish, edit, delete), create / edit with the {{field}} body and the DOCX / ZIP import flow.
export default function AdminTemplatesPage() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [category, setCategory] = useState("");
  const [shown, setShown] = useState(STEP);
  const [importing, setImporting] = useState(false);
  const form = useSheetTarget<{ tpl: Template | null }>();
  const query = useTemplates();
  const term = useDebounced(q, 250);
  const all = useMemo(() => query.data ?? [], [query.data]);
  const items = useMemo(() => filterTemplates(all, term, state, category), [all, term, state, category]);
  const { remove, toggle } = useTemplateActions();
  const reset = <T,>(set: (v: T) => void) => (v: T) => { setShown(STEP); set(v); };
  const paged = { isLoading: query.isLoading, isError: query.isError, error: query.error, refetch: query.refetch, isRefetching: query.isRefetching, hasNextPage: items.length > shown, fetchNextPage: () => setShown((n) => n + STEP) };
  return (
    <AdminPage title={t("admHub.mod.templates.title")} right={<><ExportButton id="templates" /><IconButton icon="upload" size={40} label={t("admTpl.importTitle")} onPress={() => setImporting(true)} /><IconButton icon="plus" size={40} label={t("adm.add")} onPress={() => form.open({ tpl: null })} /></>}>
      <PagedList
        data={items.slice(0, shown)}
        query={paged}
        keyExtractor={(d) => d.id}
        skeletonHeight={110}
        renderItem={(d) => <TemplateRow item={d} onEdit={() => form.open({ tpl: d })} onDelete={() => remove(d)} onToggle={() => toggle(d)} />}
        empty={{ icon: "file-text", title: all.length ? t("admTpl.noResults") : t("admTpl.empty") }}
        off={{ title: t("admTplC.off"), text: t("admTplC.offText") }}
        header={all.length ? <TemplatesHeader list={all} search={q} onSearch={reset(setQ)} state={state} onState={reset(setState)} category={category} onCategory={reset(setCategory)} shown={items.length} /> : null}
      />
      {form.target ? <TemplateFormSheet key={form.key} template={form.target.tpl} visible={form.visible} onClose={form.close} /> : null}
      <TemplateImportSheet visible={importing} onClose={() => setImporting(false)} />
    </AdminPage>
  );
}

import { useState } from "react";
import { useAccess } from "@/entities/access";
import { CourseRow, useCourses, type Course } from "@/entities/admin-academy";
import { CourseFormSheet } from "@/features/admin-academy";
import { CourseSheet } from "@/widgets/admin-academy";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useLocalPaged } from "@/shared/lib/adm/useLocalPaged";
import { useT } from "@/shared/i18n";

// Academy: the course catalogue (drafts included) and, for academy.manage, creating a new course.
export default function AdminAcademyPage() {
  const { t } = useT();
  const canManage = useAccess().can("academy.manage");
  const [open, setOpen] = useState<Course | null>(null);
  const [form, setForm] = useState(false);
  const query = useCourses();
  const { items, query: paged } = useLocalPaged(query, query.data ?? [], 25);
  return (
    <AdminPage title={t("admHub.mod.academy.title")} subtitle={query.data ? t("ag6.course.count", { n: query.data.length }) : undefined} right={canManage ? <IconButton icon="plus" onPress={() => setForm(true)} label={t("ag6.course.new")} /> : undefined}>
      <PagedList data={items} query={paged} keyExtractor={(c) => c.id} renderItem={(c) => <CourseRow item={c} onPress={() => setOpen(c)} />} empty={{ icon: "book-open", title: t("ag6.course.empty") }} />
      <CourseSheet item={open} onClose={() => setOpen(null)} />
      <CourseFormSheet visible={form} onClose={() => setForm(false)} />
    </AdminPage>
  );
}

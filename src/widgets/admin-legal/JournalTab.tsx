import { useState } from "react";
import { View } from "react-native";
import { ConsentRow, useSlugName, useUserConsents } from "@/entities/admin-legal";
import { useShown } from "@/entities/admin-audit";
import { UserPickerSheet } from "@/features/admin-user-picker";
import { PagedList } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { Chip, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Consents journal: who accepted which document version, when and from which IP; filter by person and document.
export function JournalTab() {
  const { t } = useT();
  const name = useSlugName();
  const [user, setUser] = useState({ id: "", name: "" });
  const [slug, setSlug] = useState("");
  const [picking, setPicking] = useState(false);
  const q = useUserConsents(user.id);
  const all = q.data ?? [];
  const slugs = [...new Set(all.map((c) => c.slug).filter(Boolean))].sort();
  const list = slug ? all.filter((c) => c.slug === slug) : all;
  const { items, query } = useShown(list, q);
  return (
    <>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(c) => c.id}
        renderItem={(c) => <ConsentRow item={c} />}
        skeletonHeight={84}
        off={{ title: t("admLegalC.off404"), text: t("admLegalC.off404Text") }}
        empty={{ icon: "shield", title: t("admLegal.journalEmpty"), text: t("admLegal.journalEmptyText") }}
        header={
          <View style={{ gap: 8, marginHorizontal: -16, paddingBottom: 10 }}>
            <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
              <Chip icon="user" label={user.id ? user.name : t("admLegal.allUsers")} active={!!user.id} onPress={() => setPicking(true)} />
              <Text variant="caption" tone="gray" style={{ alignSelf: "center" }}>{t("admLegalC.rows", { n: list.length })}</Text>
              {user.id ? <Chip icon="x" label={t("adm.reset")} onPress={() => setUser({ id: "", name: "" })} /> : null}
            </View>
            <CcTiles options={[{ value: "", label: t("admLegal.allDocs"), count: all.length }, ...slugs.map((s) => ({ value: s, label: name(s), count: all.filter((c) => c.slug === s).length }))]} value={slug} onChange={setSlug} />
          </View>
        }
      />
      <UserPickerSheet visible={picking} onClose={() => setPicking(false)} title={t("admLegal.userFilter")} onPick={(u) => setUser({ id: u.id, name: u.name || u.phone })} />
    </>
  );
}

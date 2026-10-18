import { View } from "react-native";
import { crumbsOf, type Section, type Tree } from "@/entities/pro-files";
import { UploadBar } from "@/features/pro-file-upload";
import { useT } from "@/shared/i18n";
import { Chip, IconButton } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { Crumbs } from "./Crumbs";
import { FolderButtons } from "./FolderButtons";
import { QuotaCard } from "./QuotaCard";
import type { FileFilters } from "./useFileFilters";

type Props = {
  tree?: Tree; up: Parameters<typeof UploadBar>[0]; folderId: string; section: Section; q: string; grid: boolean; sections: Section[];
  onQ: (v: string) => void; onSection: (s: Section) => void; onGo: (id: string) => void; onGrid: () => void; onUpload: () => void; onFilter: () => void; filters: FileFilters;
};

// Storage quota, upload progress, new folder / upload, search + grid/list switch on one row, section chips and the breadcrumb.
export function BrowserHeader({ tree, up, folderId, section, q, grid, onQ, onSection, onGo, onGrid, onUpload, onFilter, filters }: Props) {
  const { t } = useT();
  const on = filters.active + (section !== "all" ? 1 : 0);
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      {tree ? <QuotaCard tree={tree} /> : null}
      <UploadBar {...up} />
      <FolderButtons parent={folderId} onUpload={onUpload} busy={up.state.busy} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: -16, paddingRight: 16 }}>
        <View style={{ flex: 1 }}><SearchBox value={q} onChangeText={onQ} placeholder={t("aw8.search")} /></View>
        <IconButton icon="sliders" label={t("dm11.filters")} badge={on > 0} onPress={onFilter} />
        <IconButton icon={grid ? "list" : "grid"} label={t(grid ? "aw8.listView" : "aw8.gridView")} onPress={onGrid} />
      </View>
      {on > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {section !== "all" ? <Chip label={t(`aw8.sec.${section}`)} active icon="x" onPress={() => onSection("all")} /> : null}
          {filters.type !== "all" ? <Chip label={t(`aw8.type.${filters.type}`)} active icon="x" onPress={() => filters.setType("all")} /> : null}
          {filters.sort !== "name" ? <Chip label={t(`aw8.sort.${filters.sort}`)} active icon="x" onPress={() => filters.setSort("name")} /> : null}
        </View>
      ) : null}
      {section === "all" && tree ? <Crumbs chain={crumbsOf(tree.folders, folderId)} onGo={onGo} /> : null}
    </View>
  );
}

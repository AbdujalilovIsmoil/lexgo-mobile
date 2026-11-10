import { normCategoryTree } from "@/entities/lawyer/api/categoryTreeApi";
import type { Lawyer, MarketBrowse } from "@/entities/lawyer";
import { hasCategoryIcon } from "@/entities/service/ui/CategoryIcon";
import { buildCards, categoryLabels, categorySlugs, filterCards, tabOffset, usedCategories } from "./cards";

jest.mock("lucide-react-native", () => ({})); // only the icon table's keys are read here, nothing is drawn

const seller = (ids: string[]) => ({ services: ids.map((id) => ({ id, title: id, categoryId: "c1", basePrice: 1 })) }) as unknown as Lawyer;
const browse: MarketBrowse = {
  sellers: [seller(["a"]), seller(["a", "b"]), seller(["b"])],
  meta: {
    categories: [{ id: "c1", title: "Bir" }],
    services: [
      { id: "z", title: "Yo'q", categoryId: "c1", basePrice: 5 },
      { id: "b", title: "Bbb", categoryId: "c1", basePrice: 3 },
      { id: "a", title: "Aaa", categoryId: "c1", basePrice: 2 },
      { id: "x", title: "Boshqa", categoryId: "off", basePrice: 9 },
    ],
  },
};
const tree = [{ id: "c1", path: ["Bir"], slugs: ["bir"] }];

describe("normCategoryTree", () => {
  it("flattens parents first in sort order and hides an inactive branch", () => {
    const rows = normCategoryTree({
      items: [
        { id: "r2", title: "Ikki", slug: "ikki", sort_order: 2 },
        { id: "r1", title: "Bir", slug: "bir", sort_order: 1, children: [{ id: "k1", title: "Bola", slug: "bola" }] },
        { id: "off", title: "O'chiq", is_active: false, children: [{ id: "k2", title: "Yashirin" }] },
      ],
    });
    expect(rows).toEqual([{ id: "r1", path: ["Bir"], slugs: ["bir"] }, { id: "k1", path: ["Bir", "Bola"], slugs: ["bir", "bola"] }, { id: "r2", path: ["Ikki"], slugs: ["ikki"] }]);
  });
});

describe("category icons", () => {
  it("every real category of the tree has its own icon", () => {
    const real = ["legal-doc-criminal", "legal-doc-criminal-advokat-bilan-ariza", "legal-doc-administrative", "legal-doc-administrative-ma-muriy-huquqbuzarlik", "oila-va-nikoh", "uy-joy-va-kochmas-mulk", "qarz-pul-va-undirish", "sud-va-nizolar", "jinoyat-ishlari", "mamuriy-ishlar", "mehnat-qonunchiligi", "biznes-ochish-va-kompaniya", "shartnomalar", "soliq-va-bojxona", "hujjat-va-arizalar", "davlat-organlari-bilan-nizolar", "meros", "zarar-va-istemolchi-huquqlari", "tadbirkorlik-va-biznes-himoyasi", "brend-intellektual-mulk-va-internet", "xorij-viza-va-migratsiya", "iqtisod-biznes-va-qardorilika-oid-ishlar"];
    expect(real.filter((x) => !hasCategoryIcon([x]))).toEqual([]);
    expect(hasCategoryIcon(["test-category"])).toBe(false);
  });
  it("reads the slugs from the tree, else from the flat categories", () => {
    expect(categorySlugs(tree, browse).get("c1")).toEqual(["bir"]);
    expect(categorySlugs([], { ...browse, meta: { ...browse.meta, categories: [{ id: "c1", title: "Bir", slug: "b" }] } }).get("c1")).toEqual(["b"]);
  });
});

describe("tabOffset", () => {
  it("centers a tab in the middle of the rail", () => {
    expect(tabOffset(500, 100, 400, 1000)).toBe(350);
  });
  it("stops at both ends of the rail", () => {
    expect(tabOffset(16, 100, 400, 1000)).toBe(0);
    expect(tabOffset(880, 100, 400, 1000)).toBe(600);
  });
  it("stays put when everything already fits", () => {
    expect(tabOffset(200, 100, 400, 350)).toBe(0);
  });
});

describe("the service cards", () => {
  it("counts the specialists who offer each service", () => {
    const cards = buildCards(browse, tree);
    expect(cards.find((c) => c.id === "a")?.sellers).toBe(2);
    expect(cards.find((c) => c.id === "b")?.sellers).toBe(2);
    expect(cards.find((c) => c.id === "z")?.sellers).toBe(0);
  });
  it("leaves out a service outside the active tree, keeps it when the tree failed", () => {
    expect(buildCards(browse, tree).some((c) => c.id === "x")).toBe(false);
    expect(buildCards(browse, []).some((c) => c.id === "x")).toBe(true);
  });
  it("falls back to the sellers' services when the catalogue is empty", () => {
    expect(buildCards({ ...browse, meta: { categories: [], services: [] } }, []).map((c) => c.id)).toEqual(["a", "b"]);
  });
  it("puts offered services first and searches the title and the category", () => {
    const cards = buildCards(browse, tree);
    const labels = categoryLabels(tree, browse, (s) => s);
    expect(filterCards(cards, "", "", labels).map((c) => c.id)).toEqual(["a", "b", "z"]);
    expect(filterCards(cards, "", "bbb", labels).map((c) => c.id)).toEqual(["b"]);
    expect(filterCards(cards, "", "bir", labels)).toHaveLength(3);
    expect(filterCards(cards, "nope", "", labels)).toHaveLength(0);
  });
  it("gives a chip only to a category somebody sells in", () => {
    const labels = categoryLabels(tree, browse, (s) => s);
    expect(usedCategories(buildCards(browse, tree), labels)).toEqual(["c1"]);
    expect(usedCategories(buildCards({ ...browse, sellers: [] }, tree), labels)).toEqual([]);
  });
  it("joins the tree's path into the label, else uses the flat categories", () => {
    const up = (s: string) => s.toUpperCase();
    expect(categoryLabels([{ id: "k", path: ["a", "b"], slugs: [] }], browse, up).get("k")).toBe("A › B");
    expect(categoryLabels([], browse, up).get("c1")).toBe("BIR");
  });
});

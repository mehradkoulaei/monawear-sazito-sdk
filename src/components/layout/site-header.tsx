import type { CategoryTreeNode, MenuItem } from "@sazito/client-sdk";
import { getCategories, getHeaderMenu } from "@/lib/sazito/services";
import { siteConfig } from "@/config/site";
import { Header } from "./header";

function fromTree(nodes: CategoryTreeNode[]): MenuItem[] {
  return nodes.map((n) => ({ name: n.entity?.name ?? "", url: n.entity?.url ?? "#", children: fromTree(n.children ?? []) })).filter((m) => m.name);
}

/** Server wrapper: real menu from Sazito; falls back to the real category tree; never to invented items. */
export async function SiteHeader() {
  const [menu, cats] = await Promise.all([getHeaderMenu(), getCategories()]);
  let items: MenuItem[] = menu.data ?? [];
  if (!items.length && cats.data) items = fromTree(cats.data.tree?.treeStructure?.nodes ?? []);
  return <Header menu={items} shopName={siteConfig.name} />;
}

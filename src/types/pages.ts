export type PageEntry = {
  id: string;
  htmlFile: string;
  route: string;
  hasScript: boolean;
  externals: string[];
  profileAssets?: boolean;
  organograma?: boolean;
};

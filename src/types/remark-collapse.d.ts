declare module "remark-collapse" {
  import type { Plugin } from "unified";
  const remarkCollapse: Plugin<[{ test: string; summary?: string }]>;
  export default remarkCollapse;
}

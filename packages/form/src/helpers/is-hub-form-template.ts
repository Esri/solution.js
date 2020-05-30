import * as common from "@esri/solution-common";

export function isHubFormTemplate(template: common.IItemTemplate): boolean {
  return !!common.getProp(template, "properties.services.service");
}

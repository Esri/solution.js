import * as common from "@esri/solution-common";

/**
 * Determines if the given template is a Hub Survey
 * template vs Solutions.js Survey template.
 * @param {IITemTemplate} template A template
 * @returns {boolean}
 */
export function isHubFormTemplate(template: common.IItemTemplate): boolean {
  // relying on basic duck typing vs adding extraneous props during migration
  return !!common.getProp(template, "properties.services.service");
}

/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
/**
 * Site and Page Layout Depdendency functions
 */
import { getProp } from "../utils/object-helpers";

/**
 * Entry point that walks the Layout object graph and inspects
 * the Sections/Rows/Cards for dependencies
 *
 * @param layout Layout object
 *
 * @returns Array of the id's of the dependant items
 */
export function getLayoutDependencies(layout: any): any {
  const sections = layout.sections || [];
  return sections.reduce((deps: any, section: any) => {
    return deps.concat(getSectionDependencies(section));
  }, []);
}

/**
 * Iterate the Rows in the Section...
 * @param section Section Object
 *
 * @returns Array of the id's of the dependant items
 */
export function getSectionDependencies(section: any): any {
  return section.rows.reduce((deps: any, row: any) => {
    return deps.concat(getRowDependencies(row));
  }, []);
}
/**
 * Iterate the Cards in the Row...
 * @param row Row Object
 *
 * @returns Array of the id's of the dependant items
 */
export function getRowDependencies(row: any): any {
  return row.cards.reduce((deps: any, card: any) => {
    return deps.concat(getCardDependencies(card));
  }, []);
}

/**
 * Parse the card settings to extract the dependency ids.
 * This is where the actual useful work happens
 *
 * @param card Card Object
 *
 * @returns Array of the id's of the dependant items
 */
export function getCardDependencies(card: any): any {
  let paths = [] as any[];
  const componentName = getProp(card, "component.name");

  switch (componentName) {
    case "chart-card":
      paths = ["component.settings.itemId"];
      break;
    case "summary-statistic-card":
      paths = ["component.settings.itemId"];
      break;
    case "webmap-card":
      paths = ["component.settings.webmap"];
      break;
    case "items/gallery-card":
      paths = ["component.settings.ids"];
      break;
  }

  return paths.reduce((a, p) => {
    const v = getProp(card, p);
    if (v) {
      if (Array.isArray(v)) {
        a = a.concat(v);
      } else {
        a.push(v);
      }
    }
    return a;
  }, []);
}

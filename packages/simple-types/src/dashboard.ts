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

import * as common from "@esri/solution-common";

/**
 * The relevant elements of a Dashboard widget.
 * @protected
 */
interface IDashboardWidget {
  /**
   * AGOL item id for some widget types
   */
  itemId: string;
  /**
   * Dashboard widget type
   */
  type: string;
}

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate
): common.IItemTemplate {
  // Extract dependencies
  const widgets: IDashboardWidget[] = common.getProp(
    itemTemplate,
    "data.widgets"
  );
  if (widgets) {
    widgets.forEach((widget: any) => {
      if (widget.type === "mapWidget") {
        itemTemplate.dependencies.push(widget.itemId);
        widget.itemId = common.templatizeTerm(
          widget.itemId,
          widget.itemId,
          ".id"
        );
      }
    });
  }

  return itemTemplate;
}

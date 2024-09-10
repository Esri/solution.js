/** @license
 * Copyright 2024 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Provides tests for functions involving deployment of workflow items.
 */

import * as common from "@esri/solution-common";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
import * as utils from "../../common/test/mocks/utils";
import * as workflowHelpers from "../src/workflowHelpers";
const fetchMock = require("fetch-mock");

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

describe("Module `workflowHelpers`", () => {
  describe("addWorkflowItem", () => {
    it("basically works", async () => {
      const itemId = "wfw1234567890";

      const agolItem = templates.getItemTemplate("Workflow");
      agolItem.thumbnail = null;

      spyOn(common, "request").and.resolveTo({
        success: true,
        itemId,
      });

      spyOn(common, "getItemBase").and.callFake(() => {
        return Promise.resolve(mockItems.getAGOLItem("Workflow", "", itemId) as common.IItem);
      });

      const createdItemId = await workflowHelpers.addWorkflowItem(
        agolItem,
        "https://arcgis.com/orgId",
        MOCK_USER_SESSION,
      );

      expect(createdItemId).toEqual(itemId);
    });
  });

  describe("fetchAuxiliaryItems", () => {
    it("handles failure to add workflow item", async () => {
      const itemId = "wfw1234567890";

      const searchItemsSpy = spyOn(common, "searchItems").and.resolveTo({
        results: [{ id: "item1" }, { id: "item2" }, { id: "item3" }],
      } as common.ISearchResult<common.IItem>);

      const auxiliaryItemsIds = await workflowHelpers.fetchAuxiliaryItems(itemId, MOCK_USER_SESSION);

      expect(searchItemsSpy.calls.count()).toBe(1);
      expect((searchItemsSpy.calls.argsFor(0)[0] as any).q).toBe(
        "title:workflow_wfw1234567890 OR title:WorkflowLocations_wfw1234567890 OR title:workflow_views_wfw1234567890",
      );

      expect(auxiliaryItemsIds).toEqual(["item1", "item2", "item3"]);
    });
  });

  describe("_cacheLayerDetails", () => {
    it("will capture fields and update tempate dict", () => {
      const layers = [
        {
          id: "layerA",
          fields: [
            {
              alias: "a",
              name: "A",
              type: "string",
            },
          ],
        },
      ];
      const templateDictionary = {};
      const baseUrl = "http://src";
      const srcId = "src123";
      const itemId = "new123";

      templateDictionary[srcId] = {};

      const actual = {
        src123: {
          layerlayerA: {
            fields: {
              a: {
                alias: "a",
                name: "A",
                type: "string",
              },
            },
            itemId: "new123",
            layerId: "layerA",
            url: "http://src/layerA",
          },
        },
      };

      workflowHelpers._cacheLayerDetails(layers, templateDictionary, baseUrl, srcId, itemId);

      expect(templateDictionary).toEqual(actual);
    });
  });

  describe("updateTemplateDictionaryForWorkflow", () => {
    it("store ids and key values", async () => {
      const sourceId = "src123";
      const newId = "new123";

      const templateDictionary = {
        workflows: {},
        aa848a457d5d4f0495f89476b6b3dcff: {},
        bb857382b2de441e95e81a6cd1740558: {},
        cc4a067c851a47449f162a1a716748a3: {},
      };
      templateDictionary.workflows[sourceId] = {
        viewSchema: "aa848a457d5d4f0495f89476b6b3dcff",
        workflowLocations: "bb857382b2de441e95e81a6cd1740558",
        workflowSchema: "cc4a067c851a47449f162a1a716748a3",
      };
      const authentication = MOCK_USER_SESSION;

      const completeItemData = {
        base: {
          url: "http://baseurl",
          name: "basename3",
        },
        featureServiceProperties: {
          layers: [
            {
              id: "layer",
              fields: [
                {
                  alias: "layer-alias",
                  name: "layer-name",
                  type: "layer-type",
                  someotherprop: "someotherprop",
                },
              ],
            },
          ],
          tables: [
            {
              id: "table",
              fields: [
                {
                  alias: "table-alias",
                  name: "table-name",
                  type: "table-type",
                  someotherprop: "someotherprop",
                },
              ],
            },
          ],
        },
      };

      spyOn(common, "getCompleteItem").and.resolveTo(completeItemData as any);

      const workflowData = {
        groupId: "1507c6dbc36d48acaaa02ed196cb583f",
        workflowSchema: {
          itemId: "2517d1763b594b15977ed769c40cf68a",
        },
        workflowLocations: {
          itemId: "e763e40e9dbb4abda7133d6b32ac99f5",
        },
        viewSchema: {
          itemId: "7ed90e023736486c9caf9839a7acca17",
        },
        cleanupTask: {
          itemId: "2229f3386bf64f5592ed11000c184fd3",
        },
      };
      spyOn(common, "getItemDataAsJson").and.resolveTo(workflowData as any);

      const expected = {
        workflows: {
          src123: {
            viewSchema: "aa848a457d5d4f0495f89476b6b3dcff",
            workflowLocations: "bb857382b2de441e95e81a6cd1740558",
            workflowSchema: "cc4a067c851a47449f162a1a716748a3",
          },
        },
        aa848a457d5d4f0495f89476b6b3dcff: {
          itemId: "7ed90e023736486c9caf9839a7acca17",
          url: "http://baseurl",
          name: "basename3",
          layerlayer: {
            fields: {
              "layer-name": {
                alias: "layer-alias",
                name: "layer-name",
                type: "layer-type",
              },
            },
            itemId: "7ed90e023736486c9caf9839a7acca17",
            layerId: "layer",
            url: "http://baseurl/layer",
          },
          layertable: {
            fields: {
              "table-name": {
                alias: "table-alias",
                name: "table-name",
                type: "table-type",
              },
            },
            itemId: "7ed90e023736486c9caf9839a7acca17",
            layerId: "table",
            url: "http://baseurl/table",
          },
        },
        bb857382b2de441e95e81a6cd1740558: {
          itemId: "e763e40e9dbb4abda7133d6b32ac99f5",
          url: "http://baseurl",
          name: "basename3",
          layerlayer: {
            fields: {
              "layer-name": {
                alias: "layer-alias",
                name: "layer-name",
                type: "layer-type",
              },
            },
            itemId: "e763e40e9dbb4abda7133d6b32ac99f5",
            layerId: "layer",
            url: "http://baseurl/layer",
          },
          layertable: {
            fields: {
              "table-name": {
                alias: "table-alias",
                name: "table-name",
                type: "table-type",
              },
            },
            itemId: "e763e40e9dbb4abda7133d6b32ac99f5",
            layerId: "table",
            url: "http://baseurl/table",
          },
        },
        cc4a067c851a47449f162a1a716748a3: {
          itemId: "2517d1763b594b15977ed769c40cf68a",
          url: "http://baseurl",
          name: "basename3",
          layerlayer: {
            fields: {
              "layer-name": {
                alias: "layer-alias",
                name: "layer-name",
                type: "layer-type",
              },
            },
            itemId: "2517d1763b594b15977ed769c40cf68a",
            layerId: "layer",
            url: "http://baseurl/layer",
          },
          layertable: {
            fields: {
              "table-name": {
                alias: "table-alias",
                name: "table-name",
                type: "table-type",
              },
            },
            itemId: "2517d1763b594b15977ed769c40cf68a",
            layerId: "table",
            url: "http://baseurl/table",
          },
        },
      };

      await workflowHelpers.updateTemplateDictionaryForWorkflow(sourceId, newId, templateDictionary, authentication);
      expect(templateDictionary).toEqual(expected);
    });
  });
});

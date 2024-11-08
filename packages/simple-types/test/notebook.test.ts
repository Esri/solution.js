/** @license
 * Copyright 2020 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Provides tests for functions involving the creation and deployment of Notebook item types.
 */

import * as common from "@esri/solution-common";
import * as utils from "../../common/test/mocks/utils";
const fetchMock = require("fetch-mock");
import * as templates from "../../common/test/mocks/templates";
import * as updateHelper from "../src/helpers/update-notebook-data";
import * as createHelper from "../src/helpers/create-item-from-template";
import * as convertHelper from "../src/helpers/convert-item-to-template";
import * as notebookProcessor from "../src/notebook";

let MOCK_USER_SESSION: common.UserSession;
let template: common.IItemTemplate;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
  template = templates.getItemTemplateSkeleton();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `notebook`: manages the creation and deployment of notebook project item types", () => {
  describe("createItemFromTemplate :: ", () => {
    it("delegated to helper", async () => {
      const createSpy = spyOn(createHelper, "createItemFromTemplate").and.resolveTo();
      const cb = (): boolean => {
        return true;
      };
      await notebookProcessor.createItemFromTemplate({} as common.IItemTemplate, {}, MOCK_USER_SESSION, cb);
      expect(createSpy.calls.count()).withContext("should delegate").toBe(1);
    });
  });

  describe("convertItemToTemplate :: ", () => {
    it("delegated to helper", async () => {
      const convertSpy = spyOn(convertHelper, "convertItemToTemplate").and.resolveTo();
      await notebookProcessor.convertItemToTemplate({}, MOCK_USER_SESSION, MOCK_USER_SESSION, {});
      expect(convertSpy.calls.count()).withContext("should delegate").toBe(1);
    });
  });

  describe("deleteProps :: ", () => {
    it("removes interpreter and papermill props", () => {
      const data: any = {
        metadata: {
          p: "",
          interpreter: {},
          papermill: {},
        },
        cells: [
          {
            metadata: {
              p: "",
              interpreter: {},
              papermill: {},
            },
          },
        ],
      };
      const expected: any = {
        metadata: {
          p: "",
        },
        cells: [
          {
            metadata: {
              p: "",
            },
          },
        ],
      };
      notebookProcessor.deleteProps(data);
      expect(data).toEqual(expected);
    });

    it("handles missing cells", () => {
      const data: any = {
        metadata: {
          p: "",
          interpreter: {},
          papermill: {},
        },
      };
      const expected: any = {
        metadata: {
          p: "",
        },
      };
      notebookProcessor.deleteProps(data);
      expect(data).toEqual(expected);
    });
  });

  describe("_updateNotebookData :: ", () => {
    it("handles update error", async () => {
      const data = {};
      // TODO: Use fetchMock to simulate failure - makes tests faster
      return updateHelper
        .updateNotebookData("itm1234567890", data, MOCK_USER_SESSION)
        .then(() => fail())
        .catch(() => Promise.resolve());
    });
  });

  describe("postProcessNotebookTemplates", () => {
    it("will replace item ids", () => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Notebook");
      itemTemplate.itemId = "3b927de78a784a5aa3981469d85cf45d";

      const templateDictionary = {
        "https://services.arcgis.com/abc/arcgis/rest/services/Layer/FeatureServer":
          "{{999583fb838d447ea628cb9afec4b945.url}}",
        "https://services.arcgis.com/abc/arcgis/rest/services/Layer/FeatureServer/0":
          "{{999583fb838d447ea628cb9afec4b945.layer0.url}}",
      };

      const data = templates.getItemTemplateData("Notebook");
      data.cells = [
        {
          source: "https://services.arcgis.com/abc/arcgis/rest/services/Layer/FeatureServer/0",
        },
      ];
      data.cells.push({
        source: "https://services.arcgis.com/abc/arcgis/rest/services/Layer/FeatureServer",
      });
      data.cells.push({
        source: "888583fb838d447ea628cb9afec4b945",
      });
      itemTemplate.data = data;

      const expectedCell = {
        source: "{{999583fb838d447ea628cb9afec4b945.layer0.url}}",
      };

      const expectedCell1 = {
        source: "{{999583fb838d447ea628cb9afec4b945.url}}",
      };

      const expectedCell2 = {
        source: "{{888583fb838d447ea628cb9afec4b945.itemId}}",
      };

      const itemTemplate2: common.IItemTemplate = templates.getItemTemplate("Notebook", [
        "888583fb838d447ea628cb9afec4b945",
      ]);

      const itemTemplates = notebookProcessor.postProcessNotebookTemplates(
        [itemTemplate, itemTemplate2],
        templateDictionary,
      );

      expect(itemTemplates[0].data.cells[0]).toEqual(expectedCell);
      expect(itemTemplates[0].data.cells[1]).toEqual(expectedCell1);
      expect(itemTemplates[0].data.cells[2]).toEqual(expectedCell2);
      expect(itemTemplates[0].dependencies).toEqual([
        "888583fb838d447ea628cb9afec4b945",
        "999583fb838d447ea628cb9afec4b945",
      ]);
    });
  });

  describe("postProcess hook ::", () => {
    it("fetch, interpolate and share", async () => {
      template = templates.getItemTemplate("Notebook");
      template.item.id = template.itemId = "3ef";
      const td = { owner: "Luke Skywalker" };

      const updateUrl = utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/3ef/update";
      fetchMock
        .get(utils.PORTAL_SUBSET.restUrl + "/content/items/3ef?f=json&token=fake-token", template.item)
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/3ef/data", {
          value: "{{owner}}",
        })
        .post(updateUrl, utils.getSuccessResponse({ id: template.item.id }));

      spyOn(console, "log").and.callFake(() => {});

      const result = await notebookProcessor.postProcess(
        "3ef",
        "Notebook",
        [],
        template,
        [template],
        td,
        MOCK_USER_SESSION,
      );
      expect(result).toEqual(utils.getSuccessResponse({ id: template.item.id }));

      const callBody = fetchMock.calls(updateUrl)[0][1].body as string;
      expect(callBody).toEqual(
        "f=json&text=%7B%22value%22%3A%22Luke%20Skywalker%22%7D&" +
          "file=%7B%22value%22%3A%22Luke%20Skywalker%22%7D&id=3ef&name=Name%20of%20an%20AGOL%20item&" +
          "title=An%20AGOL%20item&type=Notebook&typeKeywords=JavaScript&description=Description%20of%20an%20AGOL" +
          "%20item&tags=test&snippet=Snippet%20of%20an%20AGOL%20item&thumbnail=https%3A%2F%2F" +
          "myorg.maps.arcgis.com%2Fsharing%2Frest%2Fcontent%2Fitems%2Fnbk1234567890%2Finfo%2Fthumbnail" +
          "%2Fago_downloaded.png&extent=%7B%7BsolutionItemExtent%7D%7D&categories=&accessInformation=" +
          "Esri%2C%20Inc.&culture=en-us&url=&created=1520968147000&modified=1522178539000&token=fake-token",
      );
    });

    it("should update only if interpolation needed", async () => {
      template = templates.getItemTemplate("Notebook");
      template.item.id = template.itemId = "3ef";
      template.item.extent = undefined;
      const td = { owner: "Luke Skywalker" };

      fetchMock
        .get(utils.PORTAL_SUBSET.restUrl + "/content/items/3ef?f=json&token=fake-token", template.item)
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/3ef/data", {
          value: "Larry",
        });

      const result = await notebookProcessor.postProcess(
        "3ef",
        "Notebook",
        [],
        template,
        [template],
        td,
        MOCK_USER_SESSION,
      );
      expect(result).toEqual(utils.getSuccessResponse({ id: template.item.id }));
    });
  });
});

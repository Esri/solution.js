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
import * as fetchMock from "fetch-mock";
import * as templates from "../../common/test/mocks/templates";
import * as updateHelper from "../src/helpers/update-notebook-data";
import * as createHelper from "../src/helpers/create-item-from-template";
import * as convertHelper from "../src/helpers/convert-item-to-template";
import * as notebookProcessor from "../src/notebook";

let MOCK_USER_SESSION: common.ArcGISIdentityManager;
let template: common.IItemTemplate;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
  template = templates.getItemTemplateSkeleton();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `notebook`: manages the creation and deployment of notebook project item types", () => {
  describe("createItemFromTemplate :: ", () => {
    it("delegated to helper", () => {
      const createSpy = spyOn(
        createHelper,
        "createItemFromTemplate"
      ).and.resolveTo();
      const cb = (): boolean => {
        return true;
      };
      return notebookProcessor
        .createItemFromTemplate(
          {} as common.IItemTemplate,
          {},
          MOCK_USER_SESSION,
          cb
        )
        .then(() => {
          expect(createSpy.calls.count()).toBe(1, "should delegate");
        });
    });
  });
  describe("convertItemToTemplate :: ", () => {
    it("delegated to helper", () => {
      const convertSpy = spyOn(
        convertHelper,
        "convertItemToTemplate"
      ).and.resolveTo();
      return notebookProcessor
        .convertItemToTemplate("3ef", {}, MOCK_USER_SESSION, MOCK_USER_SESSION, {})
        .then(() => {
          expect(convertSpy.calls.count()).toBe(1, "should delegate");
        });
    });
  });
  describe("deleteProps :: ", () => {
    it("removes interpreter and papermill props", () => {
      const data: any = {
        metadata: {
          p: "",
          interpreter: {},
          papermill: {}
        },
        cells: [{
          metadata: {
            p: "",
            interpreter: {},
            papermill: {}
          }
        }]
      };
      const expected: any = {
        metadata: {
          p: ""
        },
        cells: [{
          metadata: {
            p: ""
          }
        }]
      }
      notebookProcessor.deleteProps(data);
      expect(data).toEqual(expected);
    });

    it("handles missing cells", () => {
      const data: any = {
        metadata: {
          p: "",
          interpreter: {},
          papermill: {}
        }
      };
      const expected: any = {
        metadata: {
          p: ""
        }
      }
      notebookProcessor.deleteProps(data);
      expect(data).toEqual(expected);
    });
  });
  describe("_updateNotebookData :: ", () => {
    it("handles update error", done => {
      const data = {};
      // TODO: Use fetchMock to simulate failure - makes tests faster
      updateHelper
        .updateNotebookData("itm1234567890", data, MOCK_USER_SESSION)
        .then(() => done.fail())
        .catch(() => done());
    });
  });
  describe("postProcess hook ::", () => {
    it("fetch, interpolate and share", () => {
      template = templates.getItemTemplate("Notebook");
      template.item.id = template.itemId = "3ef";
      const td = { owner: "Luke Skywalker" };

      const updateUrl =
        utils.PORTAL_SUBSET.restUrl + "/content/users/casey/items/3ef/update";
      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/3ef?f=json&token=fake-token",
          template.item
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/3ef/data", {
          value: "{{owner}}"
        })
        .post(updateUrl, utils.getSuccessResponse({ id: template.item.id }));

      spyOn(console, "log").and.callFake(() => {});
      return notebookProcessor
        .postProcess(
          "3ef",
          "Notebook",
          [],
          template,
          [template],
          td,
          MOCK_USER_SESSION
        )
        .then(result => {
          expect(result).toEqual(
            utils.getSuccessResponse({ id: template.item.id })
          );

          const callBody = fetchMock.calls(updateUrl)[0][1].body as string;
          expect(callBody).toEqual(
            "f=json&text=%7B%22value%22%3A%22Luke%20Skywalker%22%7D&id=3ef&name=Name%20of%20an%20AGOL%20item&" +
              "title=An%20AGOL%20item&type=Notebook&typeKeywords=JavaScript&description=Description%20of%20an%20AGOL" +
              "%20item&tags=test&snippet=Snippet%20of%20an%20AGOL%20item&thumbnail=https%3A%2F%2F" +
              "myorg.maps.arcgis.com%2Fsharing%2Frest%2Fcontent%2Fitems%2Fnbk1234567890%2Finfo%2Fthumbnail" +
              "%2Fago_downloaded.png&extent=%7B%7BsolutionItemExtent%7D%7D&categories=&accessInformation=" +
              "Esri%2C%20Inc.&culture=en-us&url=&created=1520968147000&modified=1522178539000&token=fake-token"
          );
        });
    });
    it("should update only if interpolation needed", () => {
      template = templates.getItemTemplate("Notebook");
      template.item.id = template.itemId = "3ef";
      template.item.extent = null;
      const td = { owner: "Luke Skywalker" };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/3ef?f=json&token=fake-token",
          template.item
        )
        .post(utils.PORTAL_SUBSET.restUrl + "/content/items/3ef/data", {
          value: "Larry"
        });

      return notebookProcessor
        .postProcess(
          "3ef",
          "Notebook",
          [],
          template,
          [template],
          td,
          MOCK_USER_SESSION
        )
        .then(result => {
          expect(result).toEqual(
            utils.getSuccessResponse({ id: template.item.id })
          );
        });
    });
  });
});

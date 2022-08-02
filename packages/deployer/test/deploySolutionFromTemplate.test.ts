/** @license
 * Copyright 2018 Esri
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

import {
  deploySolutionFromTemplate,
  _addSourceId,
  _applySourceToDeployOptions,
  _checkedReplaceAll,
  _getPortalBaseUrl,
  _getNewItemId,
  _updateGroupReferences
} from "../src/deploySolutionFromTemplate";
import * as common from "@esri/solution-common";
import * as deployItems from "../src/deploySolutionItems";
import * as fetchMock from "fetch-mock";
import * as mockTemplates from "../../common/test/mocks/templates";
import * as postProcess from "../src/helpers/post-process";
import * as sinon from "sinon";
import * as testUtils from "../../common/test/mocks/utils";

describe("Module `deploySolutionFromTemplate`", () => {
  describe("_getNewItemId", () => {
    it("handles id not found in template dictionary", () => {
      const sourceId = "itm1234567890";
      const templateDictionary = {};
      const actualResult = _getNewItemId(sourceId, templateDictionary);
      expect(actualResult).toEqual(sourceId);
    });
    it("handles id found in template dictionary", () => {
      const sourceId = "itm1234567890";
      const templateDictionary = {
        itm1234567890: { itemId: "bc4" }
      };
      const actualResult = _getNewItemId(sourceId, templateDictionary);
      expect(actualResult).toEqual("bc4");
    });
  });

  describe("_checkedReplaceAll", () => {
    it("_checkedReplaceAll no template", () => {
      const template: string = null;
      const oldValue = "onm";
      const newValue = "ONM";
      const expectedResult = template;

      const actualResult = _checkedReplaceAll(template, oldValue, newValue);
      expect(actualResult).toEqual(expectedResult);
    });

    it("_checkedReplaceAll no matches", () => {
      const template = "abcdefghijklmnopqrstuvwxyz";
      const oldValue = "onm";
      const newValue = "ONM";
      const expectedResult = template;

      const actualResult = _checkedReplaceAll(template, oldValue, newValue);
      expect(actualResult).toEqual(expectedResult);
    });

    it("_checkedReplaceAll one match", () => {
      const template = "abcdefghijklmnopqrstuvwxyz";
      const oldValue = "mno";
      const newValue = "MNO";
      const expectedResult = "abcdefghijklMNOpqrstuvwxyz";

      const actualResult = _checkedReplaceAll(template, oldValue, newValue);
      expect(actualResult).toEqual(expectedResult);
    });

    it("_checkedReplaceAll two matches", () => {
      const template = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
      const oldValue = "mno";
      const newValue = "MNO";
      const expectedResult =
        "abcdefghijklMNOpqrstuvwxyzabcdefghijklMNOpqrstuvwxyz";

      const actualResult = _checkedReplaceAll(template, oldValue, newValue);
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe("_getPortalBaseUrl", () => {
    let MOCK_USER_SESSION: common.ArcGISIdentityManager;

    beforeEach(() => {
      MOCK_USER_SESSION = testUtils.createRuntimeMockUserSession();
    });

    it("handles AGO portal", () => {
      const portalResponse: common.IPortal = {
        id: "",
        isPortal: false,
        name: "",
        customBaseUrl: "maps.arcgis.com",
        urlKey: "localgov"
      };
      expect(_getPortalBaseUrl(portalResponse, MOCK_USER_SESSION)).toEqual(
        "https://localgov.maps.arcgis.com"
      );
    });
    it("handles Enterprise portal", () => {
      const portalResponse: common.IPortal = {
        id: "",
        isPortal: true,
        name: "",
        portalHostname: "rpubs16029.ags.esri.com/portal"
      };
      expect(_getPortalBaseUrl(portalResponse, MOCK_USER_SESSION)).toEqual(
        "https://rpubs16029.ags.esri.com/portal"
      );
    });
    it("provides default portal base URL from authentication", () => {
      const portalResponse: common.IPortal = {
        id: "",
        isPortal: false,
        name: ""
      };
      expect(_getPortalBaseUrl(portalResponse, MOCK_USER_SESSION)).toEqual(
        "https://myorg.maps.arcgis.com"
      );
    });
  });

  describe("deploySolutionFromTemplate", () => {
    let MOCK_USER_SESSION: common.ArcGISIdentityManager;
    let MOCK_USER_SESSION_ALT: common.ArcGISIdentityManager;
    const communitySelfResponse: any = testUtils.getUserResponse();
    const portalsSelfResponse: any = testUtils.getPortalsSelfResponse();
    const alternatePortalRestUrl =
      "https://myOtherPortal.esri.com/portal//sharing/rest";

    beforeEach(() => {
      MOCK_USER_SESSION = testUtils.createRuntimeMockUserSession();
      MOCK_USER_SESSION_ALT = testUtils.createRuntimeMockUserSession(
        Date.now(),
        alternatePortalRestUrl
      );
    });

    afterEach(() => {
      fetchMock.restore();
    });

    it("defaults storageAuthentication to authentication", done => {
      const templates: common.IItemTemplate[] = [
        mockTemplates.getItemTemplate("Web Map")
      ];
      const solution: common.ISolutionItem = mockTemplates.getSolutionTemplateItem(
        templates
      );
      const folderId = "fld1234567890";
      const templateSolutionId: string = "sln1234567890";
      const solutionTemplateBase: any = solution.item;
      const solutionTemplateData: any = solution.data;
      const authentication: common.ArcGISIdentityManager = MOCK_USER_SESSION;
      const options: common.IDeploySolutionOptions = {
        templateDictionary: {
          map1234567890: { itemId: "dpl1234567890" }
        }
      };
      const deployedSolutionId = "dpl1234567890";

      const deployFnStub = sinon
        .stub(deployItems, "deploySolutionItems")
        .resolves([
          {
            id: deployedSolutionId,
            item: mockTemplates.getItemTemplate("Web Map"),
            type: "Web Map",
            postProcess: false
          }
        ]);
      const postProcessFnStub = sinon
        .stub(postProcess, "postProcess")
        .resolves();

      fetchMock
        .post("https://utility.arcgisonline.com/arcgis/rest/info", testUtils.getPortalsSelfResponse())
        .get(
          testUtils.PORTAL_SUBSET.restUrl +
            "/portals/self?f=json&token=fake-token",
          portalsSelfResponse
        )
        .get(
          testUtils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .get(
          testUtils.PORTAL_SUBSET.restUrl +
            "/content/users/casey?f=json&token=fake-token",
          testUtils.getSuccessResponse()
        )
        .get(
          testUtils.PORTAL_SUBSET.restUrl +
            "/community/users/casey?f=json&token=fake-token",
          testUtils.getSuccessResponse()
        )
        .post(
          "https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/findTransformations",
          testUtils.getTransformationsResponse()
        )
        .post(
          testUtils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
          testUtils.getCreateFolderResponse(folderId)
        )
        .post(
          "https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/project",
          testUtils.getProjectResponse()
        )
        .post(
          testUtils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/" +
            folderId +
            "/addItem",
          testUtils.getSuccessResponse({
            id: deployedSolutionId,
            folder: folderId
          })
        )
        .post(
          testUtils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/fld1234567890/items/dpl1234567890/update",
          testUtils.getSuccessResponse({ id: deployedSolutionId })
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/dpl1234567890/protect",
          { success: true }
        );

      deploySolutionFromTemplate(
        templateSolutionId,
        solutionTemplateBase,
        solutionTemplateData,
        authentication,
        options
      ).then(
        () => {
          const deployFnCall = deployFnStub.getCall(0);
          expect(deployFnCall.args[0]).toEqual(MOCK_USER_SESSION.portal); // portalSharingUrl
          expect(deployFnCall.args[3].portal).toEqual(MOCK_USER_SESSION.portal); // storageAuthentication
          expect(deployFnCall.args[6].portal).toEqual(MOCK_USER_SESSION.portal); // destinationAuthentication

          deployFnStub.restore();
          postProcessFnStub.restore();
          done();
        },
        () => {
          deployFnStub.restore();
          postProcessFnStub.restore();
          done.fail();
        }
      );
    });

    it("allows distinct authentication to the solution template", done => {
      const SERVER_INFO = {
        currentVersion: 10.1,
        fullVersion: "10.1",
        soapUrl: "http://server/arcgis/services",
        secureSoapUrl: "https://server/arcgis/services",
        owningSystemUrl: "https://myorg.maps.arcgis.com",
        authInfo: {}
      };

      const templates: common.IItemTemplate[] = [
        mockTemplates.getItemTemplate("Web Map")
      ];
      const solution: common.ISolutionItem = mockTemplates.getSolutionTemplateItem(
        templates
      );
      const folderId = "fld1234567890";
      const templateSolutionId: string = "sln1234567890";
      const solutionTemplateBase: any = solution.item;
      const solutionTemplateData: any = solution.data;
      const authentication: common.ArcGISIdentityManager = MOCK_USER_SESSION;
      const options: common.IDeploySolutionOptions = {
        storageAuthentication: MOCK_USER_SESSION_ALT,
        thumbnailurl: "https://www.arcgis.com/sln1234567890/thumbnail/",
        templateDictionary: {
          map1234567890: { itemId: "dpl1234567890" }
        }
      };
      const deployedSolutionId = "dpl1234567890";

      const deployFnStub = sinon
        .stub(deployItems, "deploySolutionItems")
        .resolves([
          {
            id: deployedSolutionId,
            item: mockTemplates.getItemTemplate("Web Map"),
            type: "Web Map",
            postProcess: false
          }
        ]);
      const postProcessFnStub = sinon
        .stub(postProcess, "postProcess")
        .resolves();

      fetchMock
        .post("https://utility.arcgisonline.com/arcgis/rest/info", testUtils.getPortalsSelfResponse())
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/portals/self?f=json&token=fake-token",
          portalsSelfResponse
        )
        .get(
          "https://myotherportal.esri.com/portal//sharing/rest/sharing/rest/portals/self?f=json&token=fake-token",
          portalsSelfResponse
        )
        .post("https://www.arcgis.com/sln1234567890/info/", portalsSelfResponse)
        .post(
          "https://www.arcgis.com/sln1234567890/thumbnail/?w=400/rest/info",
          SERVER_INFO
        )
        .post(
          "https://www.arcgis.com/sln1234567890/thumbnail/?w=400",
          testUtils.getSampleImageAsFile(),
          { sendAsJson: false }
        )
        .get(
          testUtils.PORTAL_SUBSET.restUrl +
            "/community/self?f=json&token=fake-token",
          communitySelfResponse
        )
        .get(
          testUtils.PORTAL_SUBSET.restUrl +
            "/content/users/casey?f=json&token=fake-token",
          testUtils.getSuccessResponse()
        )
        .get(
          testUtils.PORTAL_SUBSET.restUrl +
            "/community/users/casey?f=json&token=fake-token",
          testUtils.getSuccessResponse()
        )
        .post(
          "https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/findTransformations",
          testUtils.getTransformationsResponse()
        )
        .post(
          testUtils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
          testUtils.getCreateFolderResponse(folderId)
        )
        .post(
          "https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/project",
          testUtils.getProjectResponse()
        )
        .post(
          testUtils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/" +
            folderId +
            "/addItem",
          testUtils.getSuccessResponse({
            id: deployedSolutionId,
            folder: folderId
          })
        )
        .post(
          testUtils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/fld1234567890/items/dpl1234567890/update",
          testUtils.getSuccessResponse({ id: deployedSolutionId })
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/dpl1234567890/protect",
          { success: true }
        );

      deploySolutionFromTemplate(
        templateSolutionId,
        solutionTemplateBase,
        solutionTemplateData,
        authentication,
        options
      ).then(
        () => {
          const deployFnCall = deployFnStub.getCall(0);
          expect(deployFnCall.args[0]).toEqual(MOCK_USER_SESSION_ALT.portal); // portalSharingUrl
          expect(deployFnCall.args[3].portal).toEqual(
            MOCK_USER_SESSION_ALT.portal
          ); // storageAuthentication
          expect(deployFnCall.args[6].portal).toEqual(MOCK_USER_SESSION.portal); // destinationAuthentication

          deployFnStub.restore();
          postProcessFnStub.restore();
          done();
        },
        () => {
          deployFnStub.restore();
          postProcessFnStub.restore();
          done.fail();
        }
      );
    });
  });

  describe("_addSourceId", () => {
    it("will add typeKeywords for groups", () => {
      const grpTemplate = mockTemplates.getItemTemplate("Group");
      delete(grpTemplate.item.typeKeywords);
      const actual = _addSourceId([grpTemplate]);
      expect(actual[0].item.typeKeywords).toContain("source-grp1234567890");
    });
  });

  describe("_applySourceToDeployOptions", () => {
    let MOCK_USER_SESSION: common.ArcGISIdentityManager;

    beforeEach(() => {
      MOCK_USER_SESSION = testUtils.createRuntimeMockUserSession();
    });

    it("copies properties and thumbnail", () => {
      const opts = {};

      const itm = {
        id: "3ef",
        title: "the solution title",
        snippet: "the solution snippet",
        description: "the solution desc",
        tags: ["the solution tags"],
        thumbnail: "smile.png",
        type: "Web Map",
        owner: "Fred",
        created: 1,
        modified: 2,
        numViews: 3,
        size: 4
      } as common.IItem;

      const templateDictionary: any = {};

      const chk = _applySourceToDeployOptions(
        opts,
        itm,
        templateDictionary,
        MOCK_USER_SESSION
      );
      expect(chk).toEqual({
        title: "the solution title",
        snippet: "the solution snippet",
        description: "the solution desc",
        tags: ["the solution tags"],
        thumbnailurl:
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/3ef/info/smile.png"
      });
    });

    it("uses passed title and thumbnailurl", () => {
      const opts = {
        title: "Opts Title",
        thumbnailurl: "https://hub.com/th.png"
      };

      const itm = {
        id: "3ef",
        title: "the solution title",
        snippet: "the solution snippet",
        description: "the solution desc",
        tags: ["the solution tags"],
        thumbnail: "smile.png",
        type: "Web Map",
        owner: "Fred",
        created: 1,
        modified: 2,
        numViews: 3,
        size: 4
      } as common.IItem;

      const templateDictionary: any = {};

      const chk = _applySourceToDeployOptions(
        opts,
        itm,
        templateDictionary,
        MOCK_USER_SESSION
      );
      expect(chk).toEqual({
        title: "Opts Title",
        snippet: "the solution snippet",
        description: "the solution desc",
        tags: ["the solution tags"],
        thumbnailurl: "https://hub.com/th.png"
      });
    });

    const templateDictionary: any = {};

    it("skips thumbnail if solution does not have one", () => {
      const opts = {};

      const itm = {
        id: "3ef",
        title: "the solution title",
        snippet: "the solution snippet",
        description: "the solution desc",
        tags: ["the solution tags"],
        thumbnail: "smile.png",
        type: "Web Map",
        owner: "Fred",
        created: 1,
        modified: 2,
        numViews: 3,
        size: 4
      } as common.IItem;

      const chk = _applySourceToDeployOptions(
        opts,
        itm,
        templateDictionary,
        MOCK_USER_SESSION
      );
      expect(chk).toEqual({
        title: "the solution title",
        snippet: "the solution snippet",
        description: "the solution desc",
        tags: ["the solution tags"],
        thumbnailurl:
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/3ef/info/smile.png"
      });
    });
  });

  describe("_updateGroupReferences", () => {
    it("replaces group references", () => {
      const itemTemplates = [
        {
          type: "Group",
          itemId: "xyz",
          groups: ["abc", "ghi"]
        },
        {
          type: "Group",
          itemId: "def",
          groups: ["abc", "ghi"]
        }
      ];
      const templateDictionary = {
        abc: {
          itemId: "xyz"
        }
      };

      const actual = _updateGroupReferences(itemTemplates, templateDictionary);
      expect(actual).toEqual([
        {
          type: "Group",
          itemId: "xyz",
          groups: ["xyz", "ghi"]
        },
        {
          type: "Group",
          itemId: "def",
          groups: ["xyz", "ghi"]
        }
      ]);
    });
  });
});

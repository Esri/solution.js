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
import { UserSession } from "@esri/arcgis-rest-auth";

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
    let MOCK_USER_SESSION: UserSession;

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
    let MOCK_USER_SESSION: UserSession;
    let MOCK_USER_SESSION_ALT: UserSession;
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

    // Because metadata file is used in test, shield from Node because it doesn't have Blob
    if (typeof window !== "undefined") {
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
        const solutionTemplateMetadata: File = testUtils.getSampleMetadataAsFile();
        const authentication: common.UserSession = MOCK_USER_SESSION;
        const options: common.IDeploySolutionOptions = {};
        const deployedSolutionId = "dpl1234567890";
        const templateDictionary = {} as any;

        const deployFnStub = sinon
          .stub(deployItems, "deploySolutionItems")
          .resolves([
            {
              id: deployedSolutionId,
              type: "Web Map",
              postProcess: false
            }
          ]);
        const postProcessFnStub = sinon
          .stub(postProcess, "postProcess")
          .resolves();

        fetchMock
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
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createFolder",
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
          );

        deploySolutionFromTemplate(
          templateSolutionId,
          solutionTemplateBase,
          solutionTemplateData,
          solutionTemplateMetadata,
          authentication,
          options
        ).then(
          () => {
            const deployFnCall = deployFnStub.getCall(0);
            expect(deployFnCall.args[0]).toEqual(MOCK_USER_SESSION.portal); // portalSharingUrl
            expect(deployFnCall.args[3].portal).toEqual(
              MOCK_USER_SESSION.portal
            ); // storageAuthentication
            expect(deployFnCall.args[5].portal).toEqual(
              MOCK_USER_SESSION.portal
            ); // destinationAuthentication

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
    }

    it("allows distinct authentication to the solution template", done => {
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
      const solutionTemplateMetadata: File = null;
      const authentication: common.UserSession = MOCK_USER_SESSION;
      const options: common.IDeploySolutionOptions = {
        storageAuthentication: MOCK_USER_SESSION_ALT
      };
      const deployedSolutionId = "dpl1234567890";
      const templateDictionary = {} as any;

      const deployFnStub = sinon
        .stub(deployItems, "deploySolutionItems")
        .resolves([
          {
            id: deployedSolutionId,
            type: "Web Map",
            postProcess: false
          }
        ]);
      const postProcessFnStub = sinon
        .stub(postProcess, "postProcess")
        .resolves();

      fetchMock
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
        );

      deploySolutionFromTemplate(
        templateSolutionId,
        solutionTemplateBase,
        solutionTemplateData,
        solutionTemplateMetadata,
        authentication,
        options
      ).then(
        () => {
          const deployFnCall = deployFnStub.getCall(0);
          expect(deployFnCall.args[0]).toEqual(MOCK_USER_SESSION_ALT.portal); // portalSharingUrl
          expect(deployFnCall.args[3].portal).toEqual(
            MOCK_USER_SESSION_ALT.portal
          ); // storageAuthentication
          expect(deployFnCall.args[5].portal).toEqual(MOCK_USER_SESSION.portal); // destinationAuthentication

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

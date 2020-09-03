/** @license
 * Copyright 2020 Esri
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
  _addContentToSolution,
  _postProcessIgnoredItems,
  _postProcessGroupDependencies
} from "../../src/helpers/add-content-to-solution";
import * as fetchMock from "fetch-mock";
import * as createItemTemplateModule from "../../src/createItemTemplate";
import * as common from "@esri/solution-common";
import * as mockItems from "../../../common/test/mocks/agolItems";
import * as utils from "../../../common/test/mocks/utils";
import * as templates from "../../../common/test/mocks/templates";
import * as staticRelatedItemsMocks from "../../../common/test/mocks/staticRelatedItemsMocks";
import { findBy } from "@esri/hub-common";
// Set up a UserSession to use in all these tests
const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("_addContentToSolution", () => {
  it("_addContentToSolution item progress callback with new item", done => {
    const solutionId = "sln1234567890";
    const itemIds = ["map1234567890"];

    let numSpyCalls = 0;
    spyOn(createItemTemplateModule, "createItemTemplate").and.callFake(
      (
        solutionItemId: string,
        itemId: string,
        templateDictionary: any,
        authentication: common.UserSession,
        existingTemplates: common.IItemTemplate[],
        itemProgressCallback: common.IItemProgressCallback
      ) => {
        if (++numSpyCalls === 1) {
          itemProgressCallback(
            "wma1234567890",
            common.EItemProgressStatus.Started,
            0
          );
        }
        return Promise.resolve();
      }
    );

    return _addContentToSolution(
      solutionId,
      itemIds,
      MOCK_USER_SESSION,
      {}
    ).then(() => {
      expect(itemIds).toEqual(["map1234567890", "wma1234567890"]);
      done();
    });
  });

  it("_addContentToSolution item progress callback with ignored item", done => {
    const solutionId = "sln1234567890";
    const itemIds = ["map1234567890", "wma1234567890"];

    let numSpyCalls = 0;
    spyOn(createItemTemplateModule, "createItemTemplate").and.callFake(
      (
        solutionItemId: string,
        itemId: string,
        templateDictionary: any,
        authentication: common.UserSession,
        existingTemplates: common.IItemTemplate[],
        itemProgressCallback: common.IItemProgressCallback
      ) => {
        if (++numSpyCalls === 1) {
          itemProgressCallback(
            "wma1234567890",
            common.EItemProgressStatus.Ignored,
            0
          );
        }
        return Promise.resolve();
      }
    );

    // tslint:disable-next-line: no-empty
    spyOn(console, "error").and.callFake(() => {});

    return _addContentToSolution(
      solutionId,
      itemIds,
      MOCK_USER_SESSION,
      {}
    ).then(() => done());
  });

  if (typeof window !== "undefined") {
    it("_addContentToSolution item progress callback with failed item", done => {
      const solutionId = "sln1234567890";
      const itemIds = ["map1234567890"];

      staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
        total: 0,
        relatedItems: []
      });

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/map1234567890?f=json&token=fake-token",
          mockItems.getAGOLItem("Web Map")
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/map1234567890/data",
          mockItems.getAGOLItemData("Web Map")
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer/0",
          mockItems.get400FailureResponse()
        );

      // tslint:disable-next-line: no-empty
      spyOn(console, "error").and.callFake(() => {});

      return _addContentToSolution(
        solutionId,
        itemIds,
        MOCK_USER_SESSION,
        {}
      ).then(
        () => done.fail(),
        e => {
          expect(e.success).toBeFalse();
          expect(e.error).toEqual(
            "One or more items cannot be converted into templates"
          );
          done();
        }
      );
    });
  }
});

describe("_postProcessGroupDependencies", () => {
  it("remove group dependencies if we find a circular dependency with one of its items", done => {
    const groupTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    groupTemplate.item = mockItems.getAGOLItem("Group", null);
    groupTemplate.itemId = "grpb15c2df2b466da05577776e82d044";
    groupTemplate.type = "Group";

    const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    itemTemplate.item = mockItems.getAGOLItem("Workforce Project", null);
    itemTemplate.itemId = "wrkccab401af4828a25cc6eaeb59fb69";
    itemTemplate.type = "Workforce Project";

    groupTemplate.dependencies = [itemTemplate.itemId];

    itemTemplate.dependencies = [groupTemplate.itemId];

    const _templates: common.IItemTemplate[] = [groupTemplate, itemTemplate];

    const expectedGroupTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    expectedGroupTemplate.item = mockItems.getAGOLItem("Group", null);
    expectedGroupTemplate.itemId = "grpb15c2df2b466da05577776e82d044";
    expectedGroupTemplate.type = "Group";
    expectedGroupTemplate.dependencies = [];

    const expectedItemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    expectedItemTemplate.item = mockItems.getAGOLItem(
      "Workforce Project",
      null
    );
    expectedItemTemplate.itemId = "wrkccab401af4828a25cc6eaeb59fb69";
    expectedItemTemplate.type = "Workforce Project";
    expectedItemTemplate.groups = [expectedGroupTemplate.itemId];
    expectedItemTemplate.dependencies = [expectedGroupTemplate.itemId];

    const expected: common.IItemTemplate[] = [
      expectedGroupTemplate,
      expectedItemTemplate
    ];

    const actual = _postProcessGroupDependencies(_templates);
    expect(actual).toEqual(expected);
    done();
  });

  it("allows for items without dependencies", () => {
    // Make the most minimal object graph to verify
    // the specific functionality of this test
    const tmpls = [
      {
        type: "Group",
        itemId: "bc3-group",
        dependencies: ["3ef-webmap", "cb7-initiative"],
        groups: []
      } as common.IItemTemplate,
      {
        type: "Web App",
        itemId: "3ef-webapp",
        dependencies: ["bc3-group"],
        groups: []
      } as common.IItemTemplate,
      {
        type: "Hub Site Application",
        itemId: "3ef-site",
        dependencies: ["3ef-webapp"],
        groups: []
      } as common.IItemTemplate,
      {
        type: "Web Map",
        itemId: "3ef-webmap",
        groups: []
      } as common.IItemTemplate
    ];
    const result = _postProcessGroupDependencies(tmpls);
    expect(result.length).toBe(4, "should have 4 templates");
    const webappEntry = findBy(result, "itemId", "3ef-webapp");
    expect(webappEntry.groups.length).toBe(
      0,
      "should not add group to web app"
    );
    const siteEntry = findBy(result, "itemId", "3ef-site");
    expect(siteEntry.groups.length).toBe(0, "should not add groups site");
    const mapEntry = findBy(result, "itemId", "3ef-webmap");
    expect(mapEntry.groups.length).toBe(1, "should add groups map");
  });

  it("add group dependencies to groups array", done => {
    const groupTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    groupTemplate.item = mockItems.getAGOLItem("Group", null);
    groupTemplate.itemId = "grpb15c2df2b466da05577776e82d044";
    groupTemplate.type = "Group";
    groupTemplate.dependencies = [];

    const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    itemTemplate.item = mockItems.getAGOLItem("Web Mapping Application", null);
    itemTemplate.itemId = "wmaccab401af4828a25cc6eaeb59fb69";
    itemTemplate.type = "Web Mapping Application";
    itemTemplate.dependencies = [groupTemplate.itemId];

    const _templates: common.IItemTemplate[] = [groupTemplate, itemTemplate];

    const expectedGroupTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    expectedGroupTemplate.item = mockItems.getAGOLItem("Group", null);
    expectedGroupTemplate.itemId = "grpb15c2df2b466da05577776e82d044";
    expectedGroupTemplate.type = "Group";
    expectedGroupTemplate.dependencies = [];

    const expectedItemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    expectedItemTemplate.item = mockItems.getAGOLItem(
      "Web Mapping Application",
      null
    );
    expectedItemTemplate.itemId = "wmaccab401af4828a25cc6eaeb59fb69";
    expectedItemTemplate.type = "Web Mapping Application";
    expectedItemTemplate.dependencies = [expectedGroupTemplate.itemId];

    const expected: common.IItemTemplate[] = [
      expectedGroupTemplate,
      expectedItemTemplate
    ];

    const actual = _postProcessGroupDependencies(_templates);
    expect(actual).toEqual(expected);
    done();
  });
});

describe("_postProcessIgnoredItems", () => {
  it("handle templates with invalid designations", () => {
    // My Layer
    const fsItemId: string = "bbb34ae01aad44c499d12feec782b386";
    const fsTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    fsTemplate.item = mockItems.getAGOLItem(
      "Feature Service",
      `{{${fsItemId}.url}}`
    );
    fsTemplate.itemId = fsItemId;
    fsTemplate.item.id = `{{${fsItemId}.itemId}}`;
    fsTemplate.data = mockItems.getAGOLItemData("Feature Service");

    // Living atlas layer
    const livingAtlasItemId: string = "ccc34ae01aad44c499d12feec782b386";
    const livingAtlasUrl: string =
      "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NWS_Watches_Warnings_v1/FeatureServer";
    const livingAtlasTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    livingAtlasTemplate.item = mockItems.getAGOLItem(
      "Feature Service",
      livingAtlasUrl
    );
    livingAtlasTemplate.itemId = livingAtlasItemId;
    livingAtlasTemplate.item.id = livingAtlasItemId;
    const livingAtlasTemplateData: any = {};
    livingAtlasTemplateData[livingAtlasItemId] = {
      itemId: livingAtlasItemId,
      layer0: {
        fields: {},
        url: livingAtlasUrl + "/0",
        layerId: "0",
        itemId: livingAtlasItemId
      }
    };
    livingAtlasTemplate.data = mockItems.getAGOLItemData("Feature Service");
    livingAtlasTemplate.data = livingAtlasTemplateData;
    livingAtlasTemplate.properties = {
      hasInvalidDesignations: true
    };

    // Web map
    const mapItemId: string = "aaa26f145e1a4cab9ae2f519f5e7f5d7";
    const mapTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
    mapTemplate.item = mockItems.getAGOLItem("Web Map");
    mapTemplate.itemId = mapItemId;
    mapTemplate.item.id = `{{${mapItemId}.itemId}}`;
    mapTemplate.data = {
      operationalLayers: [
        {
          id: "NDFD_Precipitation_v1_4323",
          url: `{{${livingAtlasItemId}.layer0.url}}`,
          itemId: `{{${livingAtlasItemId}.layer0.itemId}}`
        },
        {
          id: "My Data",
          url: `{{${fsItemId}.layer0.url}}`,
          itemId: `{{${fsItemId}.layer0.itemId}}`
        }
      ]
    };
    mapTemplate.dependencies = [fsItemId, livingAtlasItemId];

    const itemTemplates: common.IItemTemplate[] = [
      fsTemplate,
      livingAtlasTemplate,
      mapTemplate
    ];

    const expectedMapData: any = {
      operationalLayers: [
        {
          id: "NDFD_Precipitation_v1_4323",
          url: livingAtlasUrl + "/0",
          itemId: livingAtlasItemId
        },
        {
          id: "My Data",
          url: `{{${fsItemId}.layer0.url}}`,
          itemId: `{{${fsItemId}.layer0.itemId}}`
        }
      ]
    };

    const expectedMapDependencies: any[] = [fsItemId];

    const expectedMapTemplate: common.IItemTemplate = common.cloneObject(
      mapTemplate
    );
    expectedMapTemplate.data = expectedMapData;
    expectedMapTemplate.dependencies = expectedMapDependencies;
    const expectedTemplates: common.IItemTemplate[] = [
      common.cloneObject(fsTemplate),
      expectedMapTemplate
    ];

    const actualTemplates: common.IItemTemplate[] = _postProcessIgnoredItems(
      itemTemplates
    );
    const actualWebMapTemplate: common.IItemTemplate = actualTemplates[1];

    expect(actualTemplates).toEqual(expectedTemplates);
    expect(actualWebMapTemplate.data).toEqual(expectedMapData);
    expect(actualWebMapTemplate.dependencies).toEqual(expectedMapDependencies);
  });
});

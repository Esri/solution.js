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
  addContentToSolution,
  _getDependencies,
  _getIdsOutOfTemplateVariables,
  _getSolutionItemUrls,
  _getTemplateVariables,
  _postProcessGroupDependencies,
  _postProcessIgnoredItems,
  _templatizeSolutionIds,
  _replaceDictionaryItemsInObject,
  _replaceRemainingIdsInObject,
  _replaceRemainingIdsInString,
  _simplifyUrlsInItemDescriptions
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

describe("addContentToSolution", () => {
  it("addContentToSolution item progress callback with new item", done => {
    const solutionId = "sln1234567890";
    const options: common.ICreateSolutionOptions = {
      itemIds: ["map1234567890"]
    };

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
        return Promise.resolve(null);
      }
    );

    return addContentToSolution(solutionId, options, MOCK_USER_SESSION).then(
      () => {
        expect(options.itemIds).toEqual(["map1234567890", "wma1234567890"]);
        done();
      }
    );
  });

  it("addContentToSolution item progress callback with ignored item", done => {
    const solutionId = "sln1234567890";
    const options: common.ICreateSolutionOptions = {
      itemIds: ["map1234567890", "wma1234567890"]
    };

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
        return Promise.resolve(null);
      }
    );

    spyOn(console, "error").and.callFake(() => {});

    return addContentToSolution(
      solutionId,
      options,
      MOCK_USER_SESSION
    ).then(() => done());
  });

  if (typeof window !== "undefined") {
    it("addContentToSolution item progress callback with failed item", done => {
      const solutionId = "sln1234567890";
      const options: common.ICreateSolutionOptions = {
        itemIds: ["map1234567890"]
      };

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

      spyOn(console, "error").and.callFake(() => {});

      return addContentToSolution(solutionId, options, MOCK_USER_SESSION).then(
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

describe("_getDependencies", () => {
  it("get ids out of string", () => {
    const template: common.IItemTemplate = templates.getItemTemplate("Web Map");
    template.itemId = template.item.id = "854f1128cb784cf692e848390452d100";
    template.item.description =
      "https://experience.arcgis.com/experience/{{fcb2bf2837a6404ebb418a1f805f976a.itemId}}<div>{{portalBaseUrl}}/apps/webappviewer/index.html?id={{cefb7d787b8b4edb971efba758ee0c1e.itemId}}</div>{{" +
      template.itemId +
      "}}";
    template.dependencies = ["124f66175750431096575c449b42bd65"];
    expect(_getDependencies(template)).toEqual([
      "124f66175750431096575c449b42bd65",
      "cefb7d787b8b4edb971efba758ee0c1e",
      "fcb2bf2837a6404ebb418a1f805f976a"
    ]);
  });
});

describe("_getIdsOutOfTemplateVariables", () => {
  it("get ids out of string", () => {
    expect(_getIdsOutOfTemplateVariables([])).toEqual([]);
    expect(_getIdsOutOfTemplateVariables(["portalBaseUrl"])).toEqual([]);
    expect(_getIdsOutOfTemplateVariables(["solutionItemExtent"])).toEqual([]);
    expect(
      _getIdsOutOfTemplateVariables(["9fd7d55c84e84fe1b93f073a8088b435"])
    ).toEqual(["9fd7d55c84e84fe1b93f073a8088b435"]);
    expect(
      _getIdsOutOfTemplateVariables([
        "9fd7d55c84e84fe1b93f073a8088b435",
        "bad3483e025c47338d43df308c117308"
      ])
    ).toEqual([
      "9fd7d55c84e84fe1b93f073a8088b435",
      "bad3483e025c47338d43df308c117308"
    ]);
    expect(
      _getIdsOutOfTemplateVariables([
        "fcb2bf2837a6404ebb418a1f805f976a.itemId",
        "cefb7d787b8b4edb971efba758ee0c1e"
      ])
    ).toEqual([
      "fcb2bf2837a6404ebb418a1f805f976a",
      "cefb7d787b8b4edb971efba758ee0c1e"
    ]);
  });
});

describe("_getSolutionItemUrls", () => {
  it("gets item id/URL pairs for items with URLs", () => {
    const templateList = [
      templates.getItemTemplate("Notebook", null, "url1"),
      templates.getItemTemplate("Oriented Imagery Catalog", null, "url2"),
      templates.getItemTemplate("QuickCapture Project", null, "url3"),
      templates.getItemTemplate("Web Map", null, "url4"),
      templates.getItemTemplate("Web Mapping Application", null, "url5"),
      templates.getItemTemplate("Workforce Project", null, "url6")
    ];
    expect(_getSolutionItemUrls(templateList)).toEqual([
      ["nbk1234567890", "url1"],
      ["oic1234567890", "url2"],
      ["qck1234567890", "url3"],
      ["map1234567890", "url4"],
      ["wma1234567890", "url5"],
      ["wrk1234567890", "url6"]
    ]);
  });

  it("skips items without a URL", () => {
    const templateList = [
      templates.getItemTemplate("Notebook", null, ""),
      templates.getItemTemplate("Oriented Imagery Catalog", null, "url2"),
      templates.getItemTemplate("QuickCapture Project", null, ""),
      templates.getItemTemplate("Web Map", null, "url4"),
      templates.getItemTemplate("Web Mapping Application", null, "url5"),
      templates.getItemTemplate("Workforce Project", null, "url6")
    ];
    expect(_getSolutionItemUrls(templateList)).toEqual([
      ["oic1234567890", "url2"],
      ["map1234567890", "url4"],
      ["wma1234567890", "url5"],
      ["wrk1234567890", "url6"]
    ]);
  });

  it("handles a list of items without URLs", () => {
    const templateList = [
      templates.getItemTemplate("Notebook", null, ""),
      templates.getItemTemplate("Oriented Imagery Catalog", null, ""),
      templates.getItemTemplate("QuickCapture Project", null, ""),
      templates.getItemTemplate("Workforce Project", null, "")
    ];
    expect(_getSolutionItemUrls(templateList)).toEqual([]);
  });

  it("handles an empty list", () => {
    const templateList: common.IItemTemplate[] = [];
    expect(_getSolutionItemUrls(templateList)).toEqual([]);
  });
});

describe("_getTemplateVariables", () => {
  it("get variables out of string", () => {
    expect(_getTemplateVariables("")).toEqual([]);
    expect(_getTemplateVariables("{{portalBaseUrl}} and many more")).toEqual([
      "portalBaseUrl"
    ]);
    expect(
      _getTemplateVariables(
        "this is a variable: {{solutionItemExtent}} (to be extracted)"
      )
    ).toEqual(["solutionItemExtent"]);
    expect(
      _getTemplateVariables(
        "{{9fd7d55c84e84fe1b93f073a8088b435.layer1.itemId}}"
      )
    ).toEqual(["9fd7d55c84e84fe1b93f073a8088b435.layer1.itemId"]);
    expect(
      _getTemplateVariables(
        "{{9fd7d55c84e84fe1b93f073a8088b435.layer1.itemId}} and {{bad3483e025c47338d43df308c117308.itemId}}"
      )
    ).toEqual([
      "9fd7d55c84e84fe1b93f073a8088b435.layer1.itemId",
      "bad3483e025c47338d43df308c117308.itemId"
    ]);
    expect(
      _getTemplateVariables(
        "https://experience.arcgis.com/experience/{{fcb2bf2837a6404ebb418a1f805f976a.itemId}}<div>https://localdeployment.maps.arcgis.com/apps/webappviewer/index.html?id={{cefb7d787b8b4edb971efba758ee0c1e.itemId}}</div>"
      )
    ).toEqual([
      "fcb2bf2837a6404ebb418a1f805f976a.itemId",
      "cefb7d787b8b4edb971efba758ee0c1e.itemId"
    ]);
  });
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
        dependencies: ["3ef-webmap", "cb7-initiative", "3ef-webmap2"],
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
        itemId: "3ef-webmap"
      } as common.IItemTemplate,
      {
        type: "Web Map",
        itemId: "3ef-webmap2",
        groups: ["bc3-group"]
      } as common.IItemTemplate
    ];
    const result = _postProcessGroupDependencies(tmpls);
    expect(result.length).toBe(5, "should have 5 templates");
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

describe("_replaceDictionaryItemsInObject", () => {
  it("handles url keys", () => {
    const obj = {
      url:
        "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer/0"
    };
    const hash = {
      "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer/0":
        "{{svc1234567890.layer0.url}}"
    };
    const expectedObj = {
      url: "{{svc1234567890.layer0.url}}"
    };
    expect(_replaceDictionaryItemsInObject(hash, obj)).toEqual(expectedObj);
  });

  it("handles hub site application example", () => {
    const obj = {
      values: {
        url:
          "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer/0",
        layout: {
          url:
            "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer/3",
          sections: [
            {
              rows: [
                {
                  cards: [
                    {
                      component: {
                        settings: {
                          url:
                            "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer/0"
                        }
                      }
                    },
                    {
                      component: {
                        settings: {
                          url:
                            "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer"
                        }
                      }
                    },
                    {
                      component: {
                        settings: {
                          url:
                            "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer/1"
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    };
    const hash = {
      "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer":
        "{{svc1234567890.url}}",
      "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer/0":
        "{{svc1234567890.layer0.url}}",
      "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer/1":
        "{{svc1234567890.layer1.url}}"
    };
    const expectedObj = {
      values: {
        url: "{{svc1234567890.layer0.url}}",
        layout: {
          url:
            "https://services7.arcgis.com/db6e5e2ed53d4/arcgis/rest/services/myService/FeatureServer/3",
          sections: [
            {
              rows: [
                {
                  cards: [
                    {
                      component: {
                        settings: {
                          url: "{{svc1234567890.layer0.url}}"
                        }
                      }
                    },
                    {
                      component: {
                        settings: {
                          url: "{{svc1234567890.url}}"
                        }
                      }
                    },
                    {
                      component: {
                        settings: {
                          url: "{{svc1234567890.layer1.url}}"
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    };
    expect(_replaceDictionaryItemsInObject(hash, obj)).toEqual(expectedObj);
  });
});

describe("_replaceRemainingIdsInObject", () => {
  it("handles null object", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const obj: any = null;
    const expectedObj: any = null;

    expect(_replaceRemainingIdsInObject(ids, obj)).toEqual(expectedObj);
  });

  it("handles empty object", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const obj: any = {};
    const expectedObj: any = {};

    expect(_replaceRemainingIdsInObject(ids, obj)).toEqual(expectedObj);
  });

  it("handles array object", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const obj: any = [
      "e2e0569147ba47db9c527650c0d19142",
      "d0bee0c98a6d44149e558a15d4c6c939",
      "5963f61e854845c9ba1d16123aa94e78"
    ];
    const expectedObj: any = [
      "e2e0569147ba47db9c527650c0d19142",
      "d0bee0c98a6d44149e558a15d4c6c939",
      "{{5963f61e854845c9ba1d16123aa94e78.itemId}}"
    ];

    expect(_replaceRemainingIdsInObject(ids, obj)).toEqual(expectedObj);
  });

  it("handles object with array", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const obj: any = {
      defaultExtent: {
        xmin: -14675248.471277254,
        ymin: 1831373.468005408,
        xmax: -6358569.31411178,
        ymax: 8073093.611944472,
        spatialReference: {
          wkid: 102100,
          latestWkid: 3857
        }
      },
      anArray: [
        "e2e0569147ba47db9c527650c0d19142",
        "d0bee0c98a6d44149e558a15d4c6c939",
        "5963f61e854845c9ba1d16123aa94e78"
      ]
    };
    const expectedObj: any = {
      defaultExtent: {
        xmin: -14675248.471277254,
        ymin: 1831373.468005408,
        xmax: -6358569.31411178,
        ymax: 8073093.611944472,
        spatialReference: {
          wkid: 102100,
          latestWkid: 3857
        }
      },
      anArray: [
        "e2e0569147ba47db9c527650c0d19142",
        "d0bee0c98a6d44149e558a15d4c6c939",
        "{{5963f61e854845c9ba1d16123aa94e78.itemId}}"
      ]
    };

    expect(_replaceRemainingIdsInObject(ids, obj)).toEqual(expectedObj);
  });

  it("handles object", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const obj: any = {
      first: "e2e0569147ba47db9c527650c0d19142",
      second: "d0bee0c98a6d44149e558a15d4c6c939",
      third: "5963f61e854845c9ba1d16123aa94e78"
    };
    const expectedObj: any = {
      first: "e2e0569147ba47db9c527650c0d19142",
      second: "d0bee0c98a6d44149e558a15d4c6c939",
      third: "{{5963f61e854845c9ba1d16123aa94e78.itemId}}"
    };

    expect(_replaceRemainingIdsInObject(ids, obj)).toEqual(expectedObj);
  });

  it("handles Arcade expression", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const obj: any = {
      popupInfo: {
        expressionInfos: [
          {
            name: "expr0",
            title: "Status Color",
            expression:
              "if ($feature.status == 'Open') {\r\n        return '#83C96E'\r\n    }\r\nelse if ($feature.status == 'Closed') {\r\n        return '#C93100'\r\n    }\r\n\r\nelse if ($feature.status == 'Impacted') {\r\n        return '#007AC2'\r\n    }\r\nreturn '#707175';",
            returnType: "string"
          },
          {
            name: "expr1",
            title: "Submit Status Report",
            expression:
              '// Replace with the item id of Facility Status Report\r\n// For example \'4da9328722be419cbf64abd88247749b\'\r\nvar surveyID = \'4da9328722be419cbf64abd88247749b\';\r\n\r\n// Replace with the url of your ArcGIS Online or Enterprise organization\r\n// For example \'https://myorg.maps.arcgis.com/\'\r\nvar portalURL = null;\r\n\r\nreturn "https://survey123.arcgis.com/share/" + surveyID + \r\n            "?field:facilityguid=" + UrlEncode($feature.GlobalID) + \r\n            "&field:name=" + UrlEncode($feature.name) + \r\n            "&portalUrl=" + portalURL;',
            returnType: "string"
          },
          {
            name: "expr2",
            title: "Status",
            expression:
              'IIf(IsEmpty($feature.status), "Not Reported", $feature.status)',
            returnType: "string"
          }
        ],
        mediaInfos: []
      }
    };
    const expectedObj: any = {
      popupInfo: {
        expressionInfos: [
          {
            name: "expr0",
            title: "Status Color",
            expression:
              "if ($feature.status == 'Open') {\r\n        return '#83C96E'\r\n    }\r\nelse if ($feature.status == 'Closed') {\r\n        return '#C93100'\r\n    }\r\n\r\nelse if ($feature.status == 'Impacted') {\r\n        return '#007AC2'\r\n    }\r\nreturn '#707175';",
            returnType: "string"
          },
          {
            name: "expr1",
            title: "Submit Status Report",
            expression:
              '// Replace with the item id of Facility Status Report\r\n// For example \'{{4da9328722be419cbf64abd88247749b.itemId}}\'\r\nvar surveyID = \'{{4da9328722be419cbf64abd88247749b.itemId}}\';\r\n\r\n// Replace with the url of your ArcGIS Online or Enterprise organization\r\n// For example \'https://myorg.maps.arcgis.com/\'\r\nvar portalURL = null;\r\n\r\nreturn "https://survey123.arcgis.com/share/" + surveyID + \r\n            "?field:facilityguid=" + UrlEncode($feature.GlobalID) + \r\n            "&field:name=" + UrlEncode($feature.name) + \r\n            "&portalUrl=" + portalURL;',
            returnType: "string"
          },
          {
            name: "expr2",
            title: "Status",
            expression:
              'IIf(IsEmpty($feature.status), "Not Reported", $feature.status)',
            returnType: "string"
          }
        ],
        mediaInfos: []
      }
    };

    expect(_replaceRemainingIdsInObject(ids, obj)).toEqual(expectedObj);
  });

  it("handles Hub content", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const obj: any = {
      page: {
        pages: [
          {
            id: "21387aebe63d495eb708ae2eaedb5bdd",
            title: "Internal Coronavirus Business Continuity",
            slug: "internal-coronavirus-business-continuity"
          }
        ],
        cards: [
          {
            component: {
              name: "webmap-card",
              settings: {
                height: "500",
                showTitle: false,
                title: "Status Map",
                webmap: "4da9328722be419cbf64abd88247749b",
                webscene: null,
                titleAlign: "left",
                enableMapLegend: false
              }
            },
            width: 12
          }
        ],
        settings: {
          fullWidth: false,
          iframeHeight: "150px",
          iframeUrl: "",
          links: [],
          logoUrl: "",
          title: "Coronavirus Business Continuity",
          markdown:
            '<nav class="navbar navbar-default navbar-static-top first-tier">\n  <div class="container">\n    <div class="navbar-header">\n      <div class="navbar-brand">\n        <div class="site-logo">\n          <img src="https://placehold.it/50x50" alt="logo">\n          <h1>My Organization</h1>\n        </div>\n     </div>\n    </div>\n    <ul class="nav nav-pills pull-right" role="navigation">\n        <li><a href="#">Terms of Use</a></li>\n        <li><a href="#">Twitter</a></li>\n        <li><a href="#">Blog</a></li>\n    </ul>\n  </div>\n</nav>\n<nav class="navbar navbar-inverse navbar-static-top second-tier" role="navigation">\n      <div class="container">\n         <div class="navbar">\n          <ul class="nav navbar-nav">\n            <li class="active"><a href="#">Home</a></li>\n            <li><a href="#about">About</a></li>\n            <li><a href="#contact">Contact</a></li>\n          </ul>\n        </div>\n      </div>\n    </nav>\n',
          headerType: "default",
          showLogo: true,
          showTitle: true,
          logo: {
            display: {}
          },
          shortTitle: "",
          menuLinks: [
            {
              id: "21387aebe63d495eb708ae2eaedb5bdd",
              type: "Hub Page",
              name: "Internal Destination",
              external: false,
              title: "Internal Destination",
              isDraggingObject: false
            }
          ],
          socialLinks: {
            facebook: {},
            twitter: {},
            instagram: {}
          },
          schemaVersion: 2
        },
        footer: {
          component: {
            name: "site-footer",
            settings: {
              footerType: "custom",
              markdown:
                '<div class="mirror-header-theme" style="padding-bottom: 2em;">\n  <div class="container">\n    <div class="col-sm-6" style="padding-top: 2em">\n\t\t<table class="logo-title-alignment" style="background-color: transparent;">\n\t\t\t<tbody><tr>\n\t\t\t\t<td><img height="auto" src="https://www.arcgis.com/sharing/rest/content/items/e8d06c69041544de8e6fa76fa21764a4/data"></td>\n\t\t\t\t<td style="vertical-align: top; color: #fff; padding: 10px 20px; font-size: 16px;">My Organization<br>\n\t\t\t\t</td> \n\t\t\t</tr>\n\t\t</tbody></table>\n    </div>\n\t<div class="col-sm-6 contact-info-alignment" style="padding-top: 2em;">\n\t\t<div>\n\t\t\tPhone: 555-555-5555<br>\n\t\t\tEmail: <a style="color: #fff" href="mailto:contact@myorganization.gov">contact@myorganization.gov</a><br>\n\t\t\t<br>\n\t\t\t1234 Main Street<br>\n\t\t\tCity, State 55555\n\t\t</div>\n\t\t<br>\n\t\t<div>\n\t\t\t<a href="#"><svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 90 90" style="fill: #FFF;;">\n\t\t\t\t<path d="M90,15.001C90,7.119,82.884,0,75,0H15C7.116,0,0,7.119,0,15.001v59.998\n\t\t\t\tC0,82.881,7.116,90,15.001,90H45V56H34V41h11v-5.844C45,25.077,52.568,16,61.875,16H74v15H61.875C60.548,31,59,32.611,59,35.024V41\n\t\t\t\th15v15H59v34h16c7.884,0,15-7.119,15-15.001V15.001z"></path>\n\t\t\t</svg></a>\n\t\t\t<a href="#"><svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 510 510" style="fill: #FFF; margin-left: 4px;">\n\t\t\t\t<path d="M459,0H51C22.95,0,0,22.95,0,51v408c0,28.05,22.95,51,51,51h408c28.05,0,51-22.95,51-51V51C510,22.95,487.05,0,459,0z\n\t\t\t\t M400.35,186.15c-2.55,117.3-76.5,198.9-188.7,204C165.75,392.7,132.6,377.4,102,359.55c33.15,5.101,76.5-7.649,99.45-28.05\n\t\t\t\tc-33.15-2.55-53.55-20.4-63.75-48.45c10.2,2.55,20.4,0,28.05,0c-30.6-10.2-51-28.05-53.55-68.85c7.65,5.1,17.85,7.65,28.05,7.65\n\t\t\t\tc-22.95-12.75-38.25-61.2-20.4-91.8c33.15,35.7,73.95,66.3,140.25,71.4c-17.85-71.4,79.051-109.65,117.301-61.2\n\t\t\t\tc17.85-2.55,30.6-10.2,43.35-15.3c-5.1,17.85-15.3,28.05-28.05,38.25c12.75-2.55,25.5-5.1,35.7-10.2\n\t\t\t\tC425.85,165.75,413.1,175.95,400.35,186.15z"></path>\n\t\t\t</svg></a>\n\t\t\t<a href="#"><svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #FFF; margin-left: 4px;">\n\t\t\t\t<path d="M21.6 0H2.4C1.08 0 0 1.08 0 2.4v19.2C0 22.92 1.08 24 2.4 24h19.2c1.32 0 2.4-1.08 2.4-2.4V2.4C24 1.08 22.92 0 21.6 0zM7.2 20.4H3.6V9.6h3.6v10.8zM5.4 7.56c-1.2 0-2.16-.96-2.16-2.16 0-1.2.96-2.16 2.16-2.16 1.2 0 2.16.96 2.16 2.16 0 1.2-.96 2.16-2.16 2.16zm15 12.84h-3.6v-6.36c0-.96-.84-1.8-1.8-1.8-.96 0-1.8.84-1.8 1.8v6.36H9.6V9.6h3.6v1.44c.6-.96 1.92-1.68 3-1.68 2.28 0 4.2 1.92 4.2 4.2v6.84z"></path>\n\t\t\t</svg></a>\n\t\t\t<a href="#"><svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #FFF; margin-left: 4px;">\n\t\t\t\t<path d="M21.6 0H2.4C1.08 0 0 1.08 0 2.4v19.2C0 22.92 1.08 24 2.4 24h19.2c1.32 0 2.4-1.08 2.4-2.4V2.4C24 1.08 22.92 0 21.6 0zM12 7.2c2.64 0 4.8 2.16 4.8 4.8 0 2.64-2.16 4.8-4.8 4.8-2.64 0-4.8-2.16-4.8-4.8 0-2.64 2.16-4.8 4.8-4.8zM3 21.6c-.36 0-.6-.24-.6-.6V10.8h2.52c-.12.36-.12.84-.12 1.2 0 3.96 3.24 7.2 7.2 7.2s7.2-3.24 7.2-7.2c0-.36 0-.84-.12-1.2h2.52V21c0 .36-.24.6-.6.6H3zM21.6 5.4c0 .36-.24.6-.6.6h-2.4c-.36 0-.6-.24-.6-.6V3c0-.36.24-.6.6-.6H21c.36 0 .6.24.6.6v2.4z"></path>\n\t\t\t</svg></a>\n\t\t\t<a href="#"><svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #FFF; margin-left: 4px;">\n\t\t\t\t<path d="M21.6 0C22.92 0 24 1.08 24 2.4v19.2c0 1.32-1.08 2.4-2.4 2.4H2.4C1.08 24 0 22.92 0 21.6V2.4C0 1.08 1.08 0 2.4 0zM12 6.6c-2.393 0-4.338.112-5.836.335A1.6 1.6 0 0 0 4.8 8.518v6.905a1.6 1.6 0 0 0 1.387 1.586c1.937.26 3.875.391 5.813.391 1.938 0 3.876-.13 5.813-.391a1.6 1.6 0 0 0 1.387-1.586V8.518a1.6 1.6 0 0 0-1.364-1.583C16.338 6.712 14.393 6.6 12 6.6zm-1.2 3l3.6 2.4-3.6 2.4V9.6z"></path>\n\t\t\t</svg></a>\n\t\t</div>\n\t</div>\n  </div>\n</div>\n\n<style>\n\n.contact-info-alignment {\n  text-align: center;  }\n  \n.logo-title-alignment {\n  margin-left : auto;\n  margin-right: auto;  }\n\n@media (min-width: 768px) {\n  .contact-info-alignment {\n    text-align: right;\n  }\n  \n  .logo-title-alignment {\n    margin-left : initial;\n    margin-right: initial\n  }\n}\n\n</style>',
              schemaVersion: 2.1
            }
          },
          showEditor: false
        }
      }
    };
    const expectedObj: any = {
      page: {
        pages: [
          {
            id: "{{21387aebe63d495eb708ae2eaedb5bdd.itemId}}",
            title: "Internal Coronavirus Business Continuity",
            slug: "internal-coronavirus-business-continuity"
          }
        ],
        cards: [
          {
            component: {
              name: "webmap-card",
              settings: {
                height: "500",
                showTitle: false,
                title: "Status Map",
                webmap: "{{4da9328722be419cbf64abd88247749b.itemId}}",
                webscene: null,
                titleAlign: "left",
                enableMapLegend: false
              }
            },
            width: 12
          }
        ],
        settings: {
          fullWidth: false,
          iframeHeight: "150px",
          iframeUrl: "",
          links: [],
          logoUrl: "",
          title: "Coronavirus Business Continuity",
          markdown:
            '<nav class="navbar navbar-default navbar-static-top first-tier">\n  <div class="container">\n    <div class="navbar-header">\n      <div class="navbar-brand">\n        <div class="site-logo">\n          <img src="https://placehold.it/50x50" alt="logo">\n          <h1>My Organization</h1>\n        </div>\n     </div>\n    </div>\n    <ul class="nav nav-pills pull-right" role="navigation">\n        <li><a href="#">Terms of Use</a></li>\n        <li><a href="#">Twitter</a></li>\n        <li><a href="#">Blog</a></li>\n    </ul>\n  </div>\n</nav>\n<nav class="navbar navbar-inverse navbar-static-top second-tier" role="navigation">\n      <div class="container">\n         <div class="navbar">\n          <ul class="nav navbar-nav">\n            <li class="active"><a href="#">Home</a></li>\n            <li><a href="#about">About</a></li>\n            <li><a href="#contact">Contact</a></li>\n          </ul>\n        </div>\n      </div>\n    </nav>\n',
          headerType: "default",
          showLogo: true,
          showTitle: true,
          logo: {
            display: {}
          },
          shortTitle: "",
          menuLinks: [
            {
              id: "{{21387aebe63d495eb708ae2eaedb5bdd.itemId}}",
              type: "Hub Page",
              name: "Internal Destination",
              external: false,
              title: "Internal Destination",
              isDraggingObject: false
            }
          ],
          socialLinks: {
            facebook: {},
            twitter: {},
            instagram: {}
          },
          schemaVersion: 2
        },
        footer: {
          component: {
            name: "site-footer",
            settings: {
              footerType: "custom",
              markdown:
                '<div class="mirror-header-theme" style="padding-bottom: 2em;">\n  <div class="container">\n    <div class="col-sm-6" style="padding-top: 2em">\n\t\t<table class="logo-title-alignment" style="background-color: transparent;">\n\t\t\t<tbody><tr>\n\t\t\t\t<td><img height="auto" src="https://www.arcgis.com/sharing/rest/content/items/{{e8d06c69041544de8e6fa76fa21764a4.itemId}}/data"></td>\n\t\t\t\t<td style="vertical-align: top; color: #fff; padding: 10px 20px; font-size: 16px;">My Organization<br>\n\t\t\t\t</td> \n\t\t\t</tr>\n\t\t</tbody></table>\n    </div>\n\t<div class="col-sm-6 contact-info-alignment" style="padding-top: 2em;">\n\t\t<div>\n\t\t\tPhone: 555-555-5555<br>\n\t\t\tEmail: <a style="color: #fff" href="mailto:contact@myorganization.gov">contact@myorganization.gov</a><br>\n\t\t\t<br>\n\t\t\t1234 Main Street<br>\n\t\t\tCity, State 55555\n\t\t</div>\n\t\t<br>\n\t\t<div>\n\t\t\t<a href="#"><svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 90 90" style="fill: #FFF;;">\n\t\t\t\t<path d="M90,15.001C90,7.119,82.884,0,75,0H15C7.116,0,0,7.119,0,15.001v59.998\n\t\t\t\tC0,82.881,7.116,90,15.001,90H45V56H34V41h11v-5.844C45,25.077,52.568,16,61.875,16H74v15H61.875C60.548,31,59,32.611,59,35.024V41\n\t\t\t\th15v15H59v34h16c7.884,0,15-7.119,15-15.001V15.001z"></path>\n\t\t\t</svg></a>\n\t\t\t<a href="#"><svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 510 510" style="fill: #FFF; margin-left: 4px;">\n\t\t\t\t<path d="M459,0H51C22.95,0,0,22.95,0,51v408c0,28.05,22.95,51,51,51h408c28.05,0,51-22.95,51-51V51C510,22.95,487.05,0,459,0z\n\t\t\t\t M400.35,186.15c-2.55,117.3-76.5,198.9-188.7,204C165.75,392.7,132.6,377.4,102,359.55c33.15,5.101,76.5-7.649,99.45-28.05\n\t\t\t\tc-33.15-2.55-53.55-20.4-63.75-48.45c10.2,2.55,20.4,0,28.05,0c-30.6-10.2-51-28.05-53.55-68.85c7.65,5.1,17.85,7.65,28.05,7.65\n\t\t\t\tc-22.95-12.75-38.25-61.2-20.4-91.8c33.15,35.7,73.95,66.3,140.25,71.4c-17.85-71.4,79.051-109.65,117.301-61.2\n\t\t\t\tc17.85-2.55,30.6-10.2,43.35-15.3c-5.1,17.85-15.3,28.05-28.05,38.25c12.75-2.55,25.5-5.1,35.7-10.2\n\t\t\t\tC425.85,165.75,413.1,175.95,400.35,186.15z"></path>\n\t\t\t</svg></a>\n\t\t\t<a href="#"><svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #FFF; margin-left: 4px;">\n\t\t\t\t<path d="M21.6 0H2.4C1.08 0 0 1.08 0 2.4v19.2C0 22.92 1.08 24 2.4 24h19.2c1.32 0 2.4-1.08 2.4-2.4V2.4C24 1.08 22.92 0 21.6 0zM7.2 20.4H3.6V9.6h3.6v10.8zM5.4 7.56c-1.2 0-2.16-.96-2.16-2.16 0-1.2.96-2.16 2.16-2.16 1.2 0 2.16.96 2.16 2.16 0 1.2-.96 2.16-2.16 2.16zm15 12.84h-3.6v-6.36c0-.96-.84-1.8-1.8-1.8-.96 0-1.8.84-1.8 1.8v6.36H9.6V9.6h3.6v1.44c.6-.96 1.92-1.68 3-1.68 2.28 0 4.2 1.92 4.2 4.2v6.84z"></path>\n\t\t\t</svg></a>\n\t\t\t<a href="#"><svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #FFF; margin-left: 4px;">\n\t\t\t\t<path d="M21.6 0H2.4C1.08 0 0 1.08 0 2.4v19.2C0 22.92 1.08 24 2.4 24h19.2c1.32 0 2.4-1.08 2.4-2.4V2.4C24 1.08 22.92 0 21.6 0zM12 7.2c2.64 0 4.8 2.16 4.8 4.8 0 2.64-2.16 4.8-4.8 4.8-2.64 0-4.8-2.16-4.8-4.8 0-2.64 2.16-4.8 4.8-4.8zM3 21.6c-.36 0-.6-.24-.6-.6V10.8h2.52c-.12.36-.12.84-.12 1.2 0 3.96 3.24 7.2 7.2 7.2s7.2-3.24 7.2-7.2c0-.36 0-.84-.12-1.2h2.52V21c0 .36-.24.6-.6.6H3zM21.6 5.4c0 .36-.24.6-.6.6h-2.4c-.36 0-.6-.24-.6-.6V3c0-.36.24-.6.6-.6H21c.36 0 .6.24.6.6v2.4z"></path>\n\t\t\t</svg></a>\n\t\t\t<a href="#"><svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: #FFF; margin-left: 4px;">\n\t\t\t\t<path d="M21.6 0C22.92 0 24 1.08 24 2.4v19.2c0 1.32-1.08 2.4-2.4 2.4H2.4C1.08 24 0 22.92 0 21.6V2.4C0 1.08 1.08 0 2.4 0zM12 6.6c-2.393 0-4.338.112-5.836.335A1.6 1.6 0 0 0 4.8 8.518v6.905a1.6 1.6 0 0 0 1.387 1.586c1.937.26 3.875.391 5.813.391 1.938 0 3.876-.13 5.813-.391a1.6 1.6 0 0 0 1.387-1.586V8.518a1.6 1.6 0 0 0-1.364-1.583C16.338 6.712 14.393 6.6 12 6.6zm-1.2 3l3.6 2.4-3.6 2.4V9.6z"></path>\n\t\t\t</svg></a>\n\t\t</div>\n\t</div>\n  </div>\n</div>\n\n<style>\n\n.contact-info-alignment {\n  text-align: center;  }\n  \n.logo-title-alignment {\n  margin-left : auto;\n  margin-right: auto;  }\n\n@media (min-width: 768px) {\n  .contact-info-alignment {\n    text-align: right;\n  }\n  \n  .logo-title-alignment {\n    margin-left : initial;\n    margin-right: initial\n  }\n}\n\n</style>',
              schemaVersion: 2.1
            }
          },
          showEditor: false
        }
      }
    };

    expect(_replaceRemainingIdsInObject(ids, obj)).toEqual(expectedObj);
  });

  it("handles Experience Builder content", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const obj: any = {
      widgets: {
        widget_1: {
          uri: "widgets/common/embed/",
          version: "1.1.0",
          label: "Embed 1",
          config: {
            embedType: "url",
            staticUrl:
              "https://myOrg.maps.arcgis.com/apps/opsdashboard/index.html#/21387aebe63d495eb708ae2eaedb5bdd"
          },
          id: "widget_1"
        },
        widget_2: {
          uri: "widgets/common/embed/",
          version: "1.1.0",
          label: "Embed 2",
          config: {
            embedType: "url",
            staticUrl:
              "https://myOrg.maps.arcgis.com/apps/opsdashboard/index.html#/5963f61e854845c9ba1d16123aa94e78"
          },
          id: "widget_2"
        }
      }
    };
    const expectedObj: any = {
      widgets: {
        widget_1: {
          uri: "widgets/common/embed/",
          version: "1.1.0",
          label: "Embed 1",
          config: {
            embedType: "url",
            staticUrl:
              "https://myOrg.maps.arcgis.com/apps/opsdashboard/index.html#/{{21387aebe63d495eb708ae2eaedb5bdd.itemId}}"
          },
          id: "widget_1"
        },
        widget_2: {
          uri: "widgets/common/embed/",
          version: "1.1.0",
          label: "Embed 2",
          config: {
            embedType: "url",
            staticUrl:
              "https://myOrg.maps.arcgis.com/apps/opsdashboard/index.html#/{{5963f61e854845c9ba1d16123aa94e78.itemId}}"
          },
          id: "widget_2"
        }
      }
    };

    expect(_replaceRemainingIdsInObject(ids, obj)).toEqual(expectedObj);
  });
});

describe("_replaceRemainingIdsInString", () => {
  it("handles null string", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const str: string = null;

    expect(_replaceRemainingIdsInString(ids, str)).toEqual(str);
  });

  it("handles empty string", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const str = "";

    expect(_replaceRemainingIdsInString(ids, str)).toEqual(str);
  });

  it("doesn't change string if id is not in ids list", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const str = "c4a453936e8e4cafa6efdca446305077";

    expect(_replaceRemainingIdsInString(ids, str)).toEqual(str);
  });

  it("doesn't change string if binary data contains a string matching an id in the list", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const str =
      "e8d06c69041544de8e6fa76fa21764a45963f61e854845c9ba1d16123aa94e7821387aebe63d495eb708ae2eaedb5bdd4da9328722be419cbf64abd88247749b";

    expect(_replaceRemainingIdsInString(ids, str)).toEqual(str);
  });

  it("doesn't change string if id is already templatized", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const str = "{{21387aebe63d495eb708ae2eaedb5bdd.itemId}}";

    expect(_replaceRemainingIdsInString(ids, str)).toEqual(str);
  });

  it("templatizes an id in the ids list", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const str = "21387aebe63d495eb708ae2eaedb5bdd";

    expect(_replaceRemainingIdsInString(ids, str)).toEqual(
      "{{21387aebe63d495eb708ae2eaedb5bdd.itemId}}"
    );
  });

  it("templatizes an id in the ids list if it is preceeded by a single brace", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const str = "this is an id: {21387aebe63d495eb708ae2eaedb5bdd";

    expect(_replaceRemainingIdsInString(ids, str)).toEqual(
      "this is an id: {{21387aebe63d495eb708ae2eaedb5bdd.itemId}}"
    );
  });

  it("templatizes all ids in the ids list", () => {
    const ids = [
      "e8d06c69041544de8e6fa76fa21764a4",
      "5963f61e854845c9ba1d16123aa94e78",
      "21387aebe63d495eb708ae2eaedb5bdd",
      "4da9328722be419cbf64abd88247749b"
    ];
    const str =
      "ids: [21387aebe63d495eb708ae2eaedb5bdd, 5963f61e854845c9ba1d16123aa94e78, 4da9328722be419cbf64abd88247749b, 21387aebe63d495eb708ae2eaedb5bdd]";

    expect(_replaceRemainingIdsInString(ids, str)).toEqual(
      "ids: [{{21387aebe63d495eb708ae2eaedb5bdd.itemId}}, {{5963f61e854845c9ba1d16123aa94e78.itemId}}, {{4da9328722be419cbf64abd88247749b.itemId}}, {{21387aebe63d495eb708ae2eaedb5bdd.itemId}}]"
    );
  });
});

// TypeScript for es2015 doesn't have a definition for `replaceAll`, so the tests "fail" via a TypeError
if (typeof window !== "undefined") {
  describe("_simplifyUrlsInItemDescriptions", () => {
    it("replaces URL in description with simplified form 1", () => {
      const descrip1 = "Etiam rhoncus vestibulum enim, a scelerisque sem.";
      const descrip2 = "Donec rhoncus nunc in odio lobortis venenatis non.";

      const notebookTemplate = templates.getItemTemplate(
        "Notebook",
        null,
        "url1"
      );
      notebookTemplate.item.origUrl = notebookTemplate.item.url;

      const webmapTemplate = templates.getItemTemplate("Web Map", null, "url4");
      webmapTemplate.item.description =
        descrip1 + " url5,url5,url1 " + descrip2;

      const wmaTemplate = templates.getItemTemplate(
        "Web Mapping Application",
        null,
        "url5"
      );
      wmaTemplate.item.description = descrip1 + " url0 " + descrip2;
      wmaTemplate.item.origUrl = wmaTemplate.item.url;

      const workforceTemplate = templates.getItemTemplate(
        "Workforce Project",
        null,
        "url6"
      );
      workforceTemplate.item.origUrl = workforceTemplate.item.url;

      const templateList = [
        notebookTemplate,
        webmapTemplate,
        wmaTemplate,
        workforceTemplate
      ];

      _simplifyUrlsInItemDescriptions(templateList);

      expect(webmapTemplate.item.description).toEqual(
        descrip1 +
          " {{wma1234567890.url}},{{wma1234567890.url}},{{nbk1234567890.url}} " +
          descrip2
      );
      expect(wmaTemplate.item.description).toEqual(
        descrip1 + " url0 " + descrip2
      );
    });

    it("replaces URL in description with simplified form 2", () => {
      const templateList = [
        {
          itemId: "id1",
          item: {
            description:
              "https://experience.arcgis.com/experience/fcb2bf2837a6404ebb418a1f805f976a<div>https://localdeployment.maps.arcgis.com/apps/webappviewer/index.html?id=cefb7d787b8b4edb971efba758ee0c1e</div>",
            origUrl: ""
          }
        },
        {
          itemId: "id2",
          item: {
            description: "",
            origUrl:
              "https://experience.arcgis.com/experience/fcb2bf2837a6404ebb418a1f805f976a"
          }
        },
        {
          itemId: "id3",
          item: {
            description: "",
            origUrl:
              "https://localdeployment.maps.arcgis.com/apps/webappviewer/index.html?id=cefb7d787b8b4edb971efba758ee0c1e"
          }
        }
      ];

      _simplifyUrlsInItemDescriptions(templateList as any[]);

      expect(templateList[0].item.description).toEqual(
        "{{id2.url}}<div>{{id3.url}}</div>"
      );
    });

    it("doesn't choke if the description is missing", () => {
      const notebookTemplate = templates.getItemTemplate(
        "Notebook",
        null,
        "url1"
      );
      notebookTemplate.item.origUrl = notebookTemplate.item.url;
      notebookTemplate.item.description = null;

      _simplifyUrlsInItemDescriptions([notebookTemplate]);
      expect(notebookTemplate.item.description).toBeNull();
    });
  });
}

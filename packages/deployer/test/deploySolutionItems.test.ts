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

/**
 * Provides tests for functions involving deployment of items via the REST API.
 */

import * as common from "@esri/solution-common";
import * as deploySolution from "../src/deploySolutionItems";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as templates from "../../common/test/mocks/templates";
import * as utils from "../../common/test/mocks/utils";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://myorg.maps.arcgis.com",
  authInfo: {}
};

describe("Module `deploySolutionItems`", () => {
  describe("deploySolutionItems", () => {
    it("can handle unimplemented item type gracefully", done => {
      // tslint:disable-next-line: no-empty
      spyOn(console, "log").and.callFake(() => {});
      // tslint:disable-next-line: no-empty
      spyOn(console, "error").and.callFake(() => {});
      deploySolution
        .deploySolutionItems(
          "",
          "",
          [templates.getItemTemplateSkeleton()],
          MOCK_USER_SESSION,
          {},
          MOCK_USER_SESSION,
          {
            enableItemReuse: false,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK,
            consoleProgress: true
          }
        )
        .then(
          () => done.fail(),
          error => {
            expect(error).toEqual(common.failWithIds([""]));
            done();
          }
        );
    });

    it("reuse items but no items exist", done => {
      const id: string = "aa4a6047326243b290f625e80ebe6531";
      const newItemID: string = "ba4a6047326243b290f625e80ebe6531";
      const type: string = "Web Mapping Application";

      const url: string =
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890";
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        type,
        null,
        url
      );
      itemTemplate.item.thumbnail = null;
      itemTemplate.itemId = id;

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );

      const templateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/search?f=json&q=typekeywords%3Asource-" +
            id +
            "%20type%3AWeb%20Mapping%20Application%20owner%3Acasey&token=fake-token",
          {
            query: "typekeywords='source-" + id + "'",
            results: []
          }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/search?f=json&q=tags%3D%27source-" +
            id +
            "%27&token=fake-token",
          {
            query: "typekeywords='source-" + id + "'",
            results: []
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemID +
            "/update",
          utils.getSuccessResponse({ id: newItemID })
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            newItemID +
            "?f=json&token=fake-token",
          updatedItem
        );

      const expected: any[] = [
        {
          id: newItemID,
          type: type,
          postProcess: true
        }
      ];

      const expectedTemplateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };
      expectedTemplateDictionary[id] = {
        itemId: newItemID
      };

      deploySolution
        .deploySolutionItems(
          utils.PORTAL_URL,
          "sln1234567890",
          [itemTemplate],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          {
            enableItemReuse: true,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK
          }
        )
        .then(actual => {
          delete templateDictionary[id].def;
          expect(templateDictionary)
            .withContext("test template dictionary")
            .toEqual(expectedTemplateDictionary);
          expect(actual)
            .withContext("test expected result")
            .toEqual(expected);
          done();
        }, done.fail);
    });

    it("reuse items by typeKeyword", done => {
      const id: string = "aa4a6047326243b290f625e80ebe6531";
      const foundItemID: string = "ba4a6047326243b290f625e80ebe6531";
      const type: string = "Web Mapping Application";

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        type,
        null,
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );
      itemTemplate.item.thumbnail = null;
      itemTemplate.itemId = id;

      const templateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };

      const url: string =
        "https://localdeployment.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=" +
        foundItemID;

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/search?f=json&q=typekeywords%3Asource-" +
          id +
          "%20type%3AWeb%20Mapping%20Application%20owner%3Acasey&token=fake-token",
        {
          query: "typekeywords='source-" + id + "'",
          results: [
            {
              id: foundItemID,
              type: type,
              name: "name",
              title: "title",
              url: url,
              created: 1582751986000,
              modified: 1582751989000
            }
          ]
        }
      );

      const expected: any[] = [
        {
          id: foundItemID,
          type: type,
          postProcess: false
        }
      ];

      const expectedTemplateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };
      expectedTemplateDictionary[id] = {
        itemId: foundItemID,
        name: "name",
        title: "title",
        url: url
      };

      deploySolution
        .deploySolutionItems(
          utils.PORTAL_URL,
          "sln1234567890",
          [itemTemplate],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          {
            enableItemReuse: true,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK
          }
        )
        .then(actual => {
          delete templateDictionary[id].def;
          expect(templateDictionary).toEqual(expectedTemplateDictionary);
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });

    it("reuse items by tag if no typekeyword is found", done => {
      const id: string = "aa4a6047326243b290f625e80ebe6531";
      const foundItemID: string = "ba4a6047326243b290f625e80ebe6531";
      const type: string = "Web Mapping Application";

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        type,
        null,
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );
      itemTemplate.item.thumbnail = null;
      itemTemplate.itemId = id;

      const templateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };

      const url: string =
        "https://localdeployment.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=" +
        foundItemID;

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/search?f=json&q=typekeywords%3Asource-" +
            id +
            "%20type%3AWeb%20Mapping%20Application%20owner%3Acasey&token=fake-token",
          {
            query: "typekeywords='source-" + id + "'",
            results: []
          }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/search?f=json&q=tags%3D%27source-" +
            id +
            "%27&token=fake-token",
          {
            query: "tags='source-" + id + "'",
            results: [
              {
                id: foundItemID,
                type: type,
                name: "name",
                title: "title",
                url: url,
                created: 1582751986000,
                modified: 1582751989000
              }
            ]
          }
        );

      const expected: any[] = [
        {
          id: foundItemID,
          type: type,
          postProcess: false
        }
      ];
      const expectedTemplateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };
      expectedTemplateDictionary[id] = {
        itemId: foundItemID,
        name: "name",
        title: "title",
        url: url
      };

      deploySolution
        .deploySolutionItems(
          utils.PORTAL_URL,
          "sln1234567890",
          [itemTemplate],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          {
            enableItemReuse: true,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK
          }
        )
        .then(actual => {
          delete templateDictionary[id].def;
          expect(templateDictionary).toEqual(expectedTemplateDictionary);
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });

    it("reuse items will use newest when mutiple items are found", done => {
      const id: string = "aa4a6047326243b290f625e80ebe6531";
      const foundItemID: string = "ba4a6047326243b290f625e80ebe6531";
      const foundItemID2: string = "ca4a6047326243b290f625e80ebe6531";
      const type: string = "Web Mapping Application";

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        type,
        null,
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );
      itemTemplate.item.thumbnail = null;
      itemTemplate.itemId = id;

      const templateDictionary: any = {
        user: mockItems.getAGOLUser("casey"),
        organization: {
          isPortal: true
        }
      };

      const url1: string =
        "https://localdeployment.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=" +
        foundItemID;
      const url2: string =
        "https://localdeployment.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=" +
        foundItemID2;

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/search?f=json&q=typekeywords%3Asource-" +
          id +
          "%20type%3AWeb%20Mapping%20Application%20owner%3Acasey&token=fake-token",
        {
          query: "typekeywords='source-" + id + "'",
          results: [
            {
              id: foundItemID,
              type: type,
              name: "name1",
              title: "title1",
              url: url1,
              created: 1582751986000
            },
            {
              id: foundItemID2,
              type: type,
              name: "name2",
              title: "title2",
              url: url2,
              created: 1582751989000
            }
          ]
        }
      );

      const expected: any[] = [
        {
          id: foundItemID2,
          type: type,
          postProcess: false
        }
      ];
      const expectedTemplateDictionary: any = {
        user: mockItems.getAGOLUser("casey"),
        organization: {
          isPortal: true
        }
      };
      expectedTemplateDictionary[id] = {
        itemId: foundItemID2,
        name: "name2",
        title: "title2",
        url: url2
      };

      deploySolution
        .deploySolutionItems(
          utils.PORTAL_URL,
          "sln1234567890",
          [itemTemplate],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          {
            enableItemReuse: true,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK
          }
        )
        .then(actual => {
          delete templateDictionary[id].def;
          expect(templateDictionary).toEqual(expectedTemplateDictionary);
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });

    it("reuse items will add feature service details to templateDictionary", done => {
      const id: string = "aa4a6047326243b290f625e80ebe6531";
      const foundItemID: string = "ba4a6047326243b290f625e80ebe6531";
      const foundItemID2: string = "ca4a6047326243b290f625e80ebe6531";
      const type: string = "Feature Service";
      const url1: string =
        "https://services.arcgis.com/orgidFmrV9d1DIvN/arcgis/rest/services/dispatchers1/FeatureServer";
      const url2: string =
        "https://services.arcgis.com/orgidFmrV9d1DIvN/arcgis/rest/services/dispatchers2/FeatureServer";

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        type,
        []
      );
      itemTemplate.item.thumbnail = null;
      itemTemplate.itemId = id;

      const templateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };

      const sourceSR = { wkid: 102100, latestWkid: 3857 };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/search?f=json&q=typekeywords%3Asource-" +
            id +
            "%20type%3AFeature%20Service%20owner%3Acasey&token=fake-token",
          {
            query: "typekeywords='source-" + id + "'",
            results: [
              {
                id: foundItemID2,
                type: type,
                name: "name2",
                title: "title2",
                url: url2,
                created: 1582751989000
              },
              {
                id: foundItemID,
                type: type,
                name: "name1",
                title: "title1",
                url: url1,
                created: 1582751986000
              }
            ]
          }
        )
        .post(url2, {
          serviceItemId: foundItemID2,
          spatialReference: sourceSR,
          fullExtent: {
            xmin: 0,
            spatialReference: sourceSR
          }
        });

      const expected: any[] = [
        {
          id: foundItemID2,
          type: type,
          postProcess: false
        }
      ];

      const expectedTemplateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };
      expectedTemplateDictionary[id] = {
        itemId: foundItemID2,
        defaultSpatialReference: sourceSR,
        defaultExtent: {
          xmin: 0,
          spatialReference: sourceSR
        },
        name: "name2",
        title: "title2",
        url: url2,
        layer0: {
          fields: {},
          url: url2 + "/0",
          layerId: "0",
          itemId: foundItemID2
        },
        layer1: {
          fields: {},
          url: url2 + "/1",
          layerId: "1",
          itemId: foundItemID2
        }
      };

      deploySolution
        .deploySolutionItems(
          utils.PORTAL_URL,
          "sln1234567890",
          [itemTemplate],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          {
            enableItemReuse: true,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK
          }
        )
        .then(actual => {
          delete templateDictionary[id].def;
          expect(templateDictionary).toEqual(expectedTemplateDictionary);
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });

    it("reuse items can handle groups", done => {
      const id: string = "aa4a6047326243b290f625e80ebe6531";
      const foundItemID: string = "ba4a6047326243b290f625e80ebe6531";
      const type: string = "Group";

      const itemTemplate: common.IItemTemplate = templates.getGroupTemplatePart();
      itemTemplate.item.thumbnail = null;
      itemTemplate.itemId = id;
      itemTemplate.item.id = "{{" + id + ".itemId}}";

      const group: any = mockItems.getAGOLGroup();
      group.id = foundItemID;
      group.tags.push("source-" + id);
      const user: any = mockItems.getAGOLUser("casey");
      user.groups = [group];
      const templateDictionary: any = {
        user: user
      };

      const expected: any[] = [
        {
          id: foundItemID,
          type: type,
          postProcess: false
        }
      ];
      const expectedTemplateDictionary: any = {
        user: user
      };
      expectedTemplateDictionary[id] = {
        itemId: group.id,
        name: group.name,
        title: group.title,
        url: group.url
      };

      deploySolution
        .deploySolutionItems(
          utils.PORTAL_URL,
          "sln1234567890",
          [itemTemplate],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          {
            enableItemReuse: true,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK
          }
        )
        .then(actual => {
          delete templateDictionary[id].def;
          expect(templateDictionary).toEqual(expectedTemplateDictionary);
          expect(actual).toEqual(expected);
          done();
        }, done.fail);
    });

    it("can handle error on find items by typeKeyword", done => {
      const id: string = "aa4a6047326243b290f625e80ebe6531";
      const foundItemID: string = "ba4a6047326243b290f625e80ebe6531";
      const type: string = "Web Mapping Application";

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        type,
        null,
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );
      itemTemplate.item.thumbnail = null;
      itemTemplate.itemId = id;

      const templateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };

      const url: string =
        "https://localdeployment.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=" +
        foundItemID;

      fetchMock.get(
        utils.PORTAL_SUBSET.restUrl +
          "/search?f=json&q=typekeywords%3Asource-" +
          id +
          "%20type%3AWeb%20Mapping%20Application%20owner%3Acasey&token=fake-token",
        mockItems.get400Failure()
      );

      const expected: any[] = [
        {
          id: foundItemID,
          type: type,
          postProcess: false
        }
      ];

      const expectedTemplateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };
      expectedTemplateDictionary[id] = {
        itemId: foundItemID,
        name: "name",
        title: "title",
        url: url
      };

      // tslint:disable-next-line: no-empty
      spyOn(console, "error").and.callFake(() => {});
      deploySolution
        .deploySolutionItems(
          utils.PORTAL_URL,
          "sln1234567890",
          [itemTemplate],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          {
            enableItemReuse: true,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK
          }
        )
        .then(done.fail, done);
    });

    it("can handle error on find items by tag", done => {
      const id: string = "aa4a6047326243b290f625e80ebe6531";
      const foundItemID: string = "ba4a6047326243b290f625e80ebe6531";
      const type: string = "Web Mapping Application";

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        type,
        null,
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );
      itemTemplate.item.thumbnail = null;
      itemTemplate.itemId = id;

      const templateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };

      const url: string =
        "https://localdeployment.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=" +
        foundItemID;

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/search?f=json&q=typekeywords%3Asource-" +
            id +
            "%20type%3AWeb%20Mapping%20Application%20owner%3Acasey&token=fake-token",
          {
            query: "typekeywords='source-" + id + "'",
            results: []
          }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/search?f=json&q=tags%3D%27source-" +
            id +
            "%27&token=fake-token",
          mockItems.get400Failure()
        );

      const expected: any[] = [
        {
          id: foundItemID,
          type: type,
          postProcess: false
        }
      ];
      const expectedTemplateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };
      expectedTemplateDictionary[id] = {
        itemId: foundItemID,
        name: "name",
        title: "title",
        url: url
      };

      // tslint:disable-next-line: no-empty
      spyOn(console, "error").and.callFake(() => {});

      deploySolution
        .deploySolutionItems(
          utils.PORTAL_URL,
          "sln1234567890",
          [itemTemplate],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          {
            enableItemReuse: true,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK
          }
        )
        .then(done.fail, done);
    });

    it("handles failure to delete all items when unwinding after failure to deploy", done => {
      const id: string = "aa4a6047326243b290f625e80ebe6531";
      const newItemID: string = "ba4a6047326243b290f625e80ebe6531";
      const type: string = "Web Mapping Application";

      const url: string =
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890";
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        type,
        null,
        url
      );
      itemTemplate.item.thumbnail = null;
      itemTemplate.itemId = id;

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );

      const templateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/search?f=json&q=typekeywords%3Asource-" +
            id +
            "%20type%3AWeb%20Mapping%20Application%20owner%3Acasey&token=fake-token",
          {
            query: "typekeywords='source-" + id + "'",
            results: []
          }
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/search?f=json&q=tags%3D%27source-" +
            id +
            "%27&token=fake-token",
          {
            query: "typekeywords='source-" + id + "'",
            results: []
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getFailureResponse({ id: newItemID })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/" +
            newItemID +
            "/delete",
          utils.getFailureResponse({
            itemId: newItemID
          })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/community/groups/" +
            newItemID +
            "/delete",
          utils.getFailureResponse({
            groupId: "aa4a6047326243b290f625e80ebe6531"
          })
        );
      // tslint:disable-next-line: no-empty
      spyOn(console, "error").and.callFake(() => {});

      const expected: any[] = [
        {
          id: newItemID,
          type: type,
          postProcess: true
        }
      ];

      const expectedTemplateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };
      expectedTemplateDictionary[id] = {
        itemId: newItemID
      };

      // tslint:disable-next-line: no-empty
      spyOn(console, "log").and.callFake(() => {});
      deploySolution
        .deploySolutionItems(
          utils.PORTAL_URL,
          "sln1234567890",
          [itemTemplate],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          {
            jobId: "abc",
            enableItemReuse: true,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK,
            consoleProgress: true
          }
        )
        .then(done.fail, actual => {
          expect(actual).toEqual(
            utils.getFailureResponse({
              itemIds: ["aa4a6047326243b290f625e80ebe6531"]
            })
          );
          done();
        });
    });

    it("can delay when multiple views share the same source when deploying portal", () => {
      const type: string = "Feature Service";

      const fsId: string = "aa4a6047326243b290f625e80ebe6531";
      const itemTemplateFS: common.IItemTemplate = templates.getItemTemplate(
        type
      );
      itemTemplateFS.item.thumbnail = null;
      itemTemplateFS.itemId = fsId;
      itemTemplateFS.properties.service = {
        isView: false
      };
      itemTemplateFS.dependencies = [];

      const fsId2: string = "aa4a6047326243b290f625e80ebe6532";
      const itemTemplateFS2: common.IItemTemplate = templates.getItemTemplate(
        type
      );
      itemTemplateFS.item.thumbnail = null;
      itemTemplateFS.itemId = fsId2;
      itemTemplateFS.properties.service = {
        isView: false
      };
      itemTemplateFS.dependencies = [];

      const id1: string = "bb4a6047326243b290f625e80ebe6531";
      const itemTemplateView1: common.IItemTemplate = templates.getItemTemplate(
        type
      );
      itemTemplateView1.item.thumbnail = null;
      itemTemplateView1.itemId = id1;
      itemTemplateView1.properties.service = {
        isView: true
      };
      itemTemplateView1.dependencies = [fsId];

      const id2: string = "bb4a6047326243b290f625e80ebe6532";
      const itemTemplateView2: common.IItemTemplate = templates.getItemTemplate(
        type
      );
      itemTemplateView2.item.thumbnail = null;
      itemTemplateView2.itemId = id2;
      itemTemplateView2.properties.service = {
        isView: true
      };
      itemTemplateView2.dependencies = [fsId, fsId2];

      const id3: string = "bb4a6047326243b290f625e80ebe6533";
      const itemTemplateView3: common.IItemTemplate = templates.getItemTemplate(
        type
      );
      itemTemplateView3.item.thumbnail = null;
      itemTemplateView3.itemId = id3;
      itemTemplateView3.properties.service = {
        isView: true
      };
      itemTemplateView3.dependencies = [fsId];

      const actual = deploySolution._evaluateSharedViewSources([
        itemTemplateFS,
        itemTemplateView1,
        itemTemplateView2,
        itemTemplateView3
      ]);

      expect(actual[0].properties.syncViews).toEqual(undefined);
      expect(actual[1].properties.syncViews).toEqual([]);
      expect(actual[2].properties.syncViews).toEqual([
        "bb4a6047326243b290f625e80ebe6531"
      ]);
      expect(actual[3].properties.syncViews).toEqual([
        "bb4a6047326243b290f625e80ebe6531",
        "bb4a6047326243b290f625e80ebe6532"
      ]);
    });

    it("reuse items will handle error on add to templateDictionary", done => {
      const id: string = "aa4a6047326243b290f625e80ebe6531";
      const foundItemID: string = "ba4a6047326243b290f625e80ebe6531";
      const foundItemID2: string = "ca4a6047326243b290f625e80ebe6531";
      const type: string = "Feature Service";
      const url1: string =
        "https://services.arcgis.com/orgidFmrV9d1DIvN/arcgis/rest/services/dispatchers1/FeatureServer";

      const url2: string =
        "https://services.arcgis.com/orgidFmrV9d1DIvN/arcgis/rest/services/dispatchers2/FeatureServer";

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        type,
        []
      );
      itemTemplate.item.thumbnail = null;
      itemTemplate.itemId = id;

      const templateDictionary: any = {
        user: mockItems.getAGOLUser("casey")
      };

      fetchMock
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/search?f=json&q=typekeywords%3Asource-" +
            id +
            "%20type%3AFeature%20Service%20owner%3Acasey&token=fake-token",
          {
            query: "typekeywords='source-" + id + "'",
            results: [
              {
                id: foundItemID2,
                type: type,
                name: "name2",
                title: "title2",
                url: url2,
                created: 1582751989000
              },
              {
                id: foundItemID,
                type: type,
                name: "name1",
                title: "title1",
                url: url1,
                created: 1582751986000
              }
            ]
          }
        )
        .post(url2, mockItems.get500Failure());

      // tslint:disable-next-line: no-empty
      spyOn(console, "error").and.callFake(() => {});
      deploySolution
        .deploySolutionItems(
          utils.PORTAL_URL,
          "sln1234567890",
          [itemTemplate],
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          {
            enableItemReuse: true,
            progressCallback: utils.SOLUTION_PROGRESS_CALLBACK
          }
        )
        .then(done.fail, done);
    });
  });

  describe("_createItemFromTemplateWhenReady", () => {
    it("flags unimplemented item types", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Undefined"
      );
      itemTemplate.item.thumbnail = null;
      const resourceFilePaths: common.IDeployFileCopyPath[] = [];
      const templateDictionary: any = {};

      // tslint:disable-next-line: no-floating-promises
      deploySolution
        ._createItemFromTemplateWhenReady(
          itemTemplate,
          resourceFilePaths,
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then((response: common.ICreateItemFromTemplateResponse) => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        });
    });

    it("flags unsupported item types", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Unsupported"
      );
      itemTemplate.item.thumbnail = null;
      const resourceFilePaths: common.IDeployFileCopyPath[] = [];
      const templateDictionary: any = {};

      // tslint:disable-next-line: no-floating-promises
      deploySolution
        ._createItemFromTemplateWhenReady(
          itemTemplate,
          resourceFilePaths,
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then((response: common.ICreateItemFromTemplateResponse) => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        });
    });

    it("handles Web Mapping Applications that are not Storymaps", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Mapping Application",
        null,
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );
      itemTemplate.item.thumbnail = null;
      const resourceFilePaths: common.IDeployFileCopyPath[] = [];
      const templateDictionary: any = {};
      const newItemID: string = "wma1234567891";

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/wma1234567891/update",
          utils.getSuccessResponse({ id: newItemID })
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/wma1234567890?f=json&token=fake-token",
          mockItems.getAGOLItem(
            "Web Mapping Application",
            utils.PORTAL_SUBSET.portalUrl +
              "/home/webmap/viewer.html?webmap=wma1234567890"
          )
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/wma1234567891?f=json&token=fake-token",
          updatedItem
        );

      // tslint:disable-next-line: no-floating-promises
      deploySolution
        ._createItemFromTemplateWhenReady(
          itemTemplate,
          resourceFilePaths,
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then((response: common.ICreateItemFromTemplateResponse) => {
          expect(response).toEqual({
            id: newItemID,
            type: itemTemplate.type,
            postProcess: true
          });
          done();
        });
    });

    it("handles inability to get dependencies", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Web Mapping Application",
        ["svc1234567890"],
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );
      itemTemplate.item.thumbnail = null;
      const resourceFilePaths: common.IDeployFileCopyPath[] = [];
      const templateDictionary: any = {
        svc1234567890: {
          def: Promise.reject(utils.getFailureResponse())
        }
      };
      const newItemID: string = "wma1234567891";

      const updatedItem = mockItems.getAGOLItem(
        "Web Mapping Application",
        "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
      );

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
          utils.getSuccessResponse({ id: newItemID })
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/wma1234567891/update",
          utils.getSuccessResponse({ id: newItemID })
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/wma1234567890?f=json&token=fake-token",
          mockItems.getAGOLItem(
            "Web Mapping Application",
            utils.PORTAL_SUBSET.portalUrl +
              "/home/webmap/viewer.html?webmap=wma1234567890"
          )
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/wma1234567891?f=json&token=fake-token",
          updatedItem
        );

      // tslint:disable-next-line: no-floating-promises
      deploySolution
        ._createItemFromTemplateWhenReady(
          itemTemplate,
          resourceFilePaths,
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then((response: common.ICreateItemFromTemplateResponse) => {
          expect(response).toEqual(templates.getFailedItem(itemTemplate.type));
          done();
        });
    });

    it("handles FS", done => {
      const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Feature Service",
        [],
        "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer"
      );
      itemTemplate.itemId = "dd4a6047326243b290f625e80ebe6531";
      itemTemplate.item.thumbnail = null;
      itemTemplate.properties.syncViews = ["aa4a6047326243b290f625e80ebe6531"];
      const resourceFilePaths: common.IDeployFileCopyPath[] = [];
      const templateDictionary: any = {
        aa4a6047326243b290f625e80ebe6531: {
          def: function() {
            return Promise.resolve();
          }
        },
        organization: utils.getPortalsSelfResponse()
      };

      itemTemplate.properties.service.spatialReference = {
        wkid: 102100
      };

      itemTemplate.properties.defaultExtent = {
        xmin: -20037507.0671618,
        ymin: -20037507.0671618,
        xmax: 20037507.0671618,
        ymax: 20037507.0671618,
        spatialReference: {
          wkid: 102100
        }
      };

      itemTemplate.properties.layers = [
        mockItems.getAGOLLayerOrTable(0, "A", "Feature Layer")
      ];
      itemTemplate.properties.tables = [];

      const updatedItem = mockItems.getAGOLItem("Feature Service");

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
          utils.getCreateServiceResponse()
        )
        .get(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/wma1234567891?f=json&token=fake-token",
          updatedItem
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/addToDefinition",
          utils.getSuccessResponse()
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/refresh",
          utils.getSuccessResponse()
        )
        .post(
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer/0/updateDefinition",
          utils.getSuccessResponse()
        )
        .post(
          "https://myorg.maps.arcgis.com/sharing/rest/content/users/casey/items/svc1234567890/update",
          utils.getSuccessResponse()
        );

      // tslint:disable-next-line: no-floating-promises
      deploySolution
        ._createItemFromTemplateWhenReady(
          itemTemplate,
          resourceFilePaths,
          MOCK_USER_SESSION,
          templateDictionary,
          MOCK_USER_SESSION,
          utils.ITEM_PROGRESS_CALLBACK
        )
        .then((response: common.ICreateItemFromTemplateResponse) => {
          expect(response).toEqual({
            id: "svc1234567890",
            type: itemTemplate.type,
            postProcess: true
          });
          done();
        });
    });

    if (typeof window !== "undefined") {
      it("fails to deploy file data to the item", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Web Map"
        );
        itemTemplate.item.thumbnail = null;
        const resourceFilePaths: common.IDeployFileCopyPath[] = [
          {
            type: common.EFileType.Data,
            folder: "cod1234567890_info_data",
            filename: "Name of an AGOL item.zip",
            url:
              "https://myserver/doc/cod1234567890_info_data/Name of an AGOL item.zip"
          }
        ];
        const templateDictionary: any = {};
        const newItemID: string = "map1234567891";

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: newItemID })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567891/update",
            utils.getFailureResponse()
          )
          .post(
            "https://myserver/doc/cod1234567890_info_data/Name of an AGOL item.zip/rest/info",
            SERVER_INFO
          )
          .post(
            "https://myserver/doc/cod1234567890_info_data/Name of an AGOL item.zip",
            utils.getSampleZipFile("Name of an AGOL item.zip")
          )
          .post(
            "https://myserver/doc/metadata.xml",
            new Blob(["<meta><value1>a</value1><value2>b</value2></meta>"], {
              type: "text/xml"
            }),
            { sendAsJson: false }
          )
          .post(utils.PORTAL_SUBSET.restUrl + "/info", SERVER_INFO);

        // tslint:disable-next-line: no-floating-promises
        deploySolution
          ._createItemFromTemplateWhenReady(
            itemTemplate,
            resourceFilePaths,
            MOCK_USER_SESSION,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(response => {
            expect(response).toEqual(
              templates.getFailedItem(itemTemplate.type)
            );
            done();
          });
      });

      it("should handle error on copy group resources", done => {
        const itemId: string = "abc9cab401af4828a25cc6eaeb59fb69";
        const templateDictionary: any = {};
        const newItemID: string = "abc8cab401af4828a25cc6eaeb59fb69";

        const itemTemplate: common.IItemTemplate = templates.getItemTemplateSkeleton();
        itemTemplate.itemId = itemId;
        itemTemplate.type = "Group";
        itemTemplate.item.title = "Dam Inspection Assignments";

        const searchResult: any = {
          query: "Dam Inspection Assignments",
          total: 12,
          start: 1,
          num: 10,
          nextStart: 11,
          results: []
        };

        const filePaths: any[] = [
          {
            type: common.EFileType.Resource,
            folder: "aFolder",
            filename: "git_merge.png",
            url: "http://someurl"
          }
        ];

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/groups?f=json&q=Dam%20Inspection%20Assignments&token=fake-token",
            searchResult
          )
          .post(utils.PORTAL_SUBSET.restUrl + "/community/createGroup", {
            success: true,
            group: { id: newItemID }
          })
          .post("http://someurl//rest/info", {})
          .post("http://someurl/", mockItems.get400Failure());

        // tslint:disable-next-line: no-floating-promises
        deploySolution
          ._createItemFromTemplateWhenReady(
            itemTemplate,
            filePaths,
            MOCK_USER_SESSION,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(response => {
            expect(response).toEqual(
              templates.getFailedItem(itemTemplate.type)
            );
            done();
          });
      });

      it("can handle error on copyFilesFromStorage", done => {
        const itemTemplate: common.IItemTemplate = templates.getItemTemplate(
          "Web Mapping Application",
          null,
          "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
        );
        itemTemplate.item.thumbnail = null;
        const resourceFilePaths: any[] = [
          {
            type: common.EFileType.Resource,
            folder: "aFolder",
            filename: "git_merge.png",
            url: "http://someurl"
          }
        ];
        const templateDictionary: any = {};
        const newItemID: string = "wma1234567891";

        const updatedItem = mockItems.getAGOLItem(
          "Web Mapping Application",
          "https://apl.maps.arcgis.com/apps/Viewer/index.html?appid=map1234567890"
        );

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/addItem",
            utils.getSuccessResponse({ id: newItemID })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/wma1234567891/update",
            utils.getSuccessResponse({ id: newItemID })
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/wma1234567891?f=json&token=fake-token",
            updatedItem
          )
          .post("http://someurl//rest/info", {})
          .post("http://someurl/", mockItems.get400Failure());

        // tslint:disable-next-line: no-floating-promises
        deploySolution
          ._createItemFromTemplateWhenReady(
            itemTemplate,
            resourceFilePaths,
            MOCK_USER_SESSION,
            templateDictionary,
            MOCK_USER_SESSION,
            utils.ITEM_PROGRESS_CALLBACK
          )
          .then(response => {
            expect(response).toEqual(
              templates.getFailedItem(itemTemplate.type)
            );
            done();
          });
      });
    }
  });

  describe("_findExistingItemByKeyword", () => {
    it("handles group items without user groups in template dictionary", () => {
      const actual = deploySolution._findExistingItemByKeyword(
        [templates.getItemTemplate("Group")],
        {},
        MOCK_USER_SESSION
      );
      expect(actual.length).toEqual(0);
    });
  });

  describe("_moveResourcesIntoTemplate", () => {
    it("can move a thumbnail resource into a template", () => {
      const filePaths: common.IDeployFileCopyPath[] = [
        {
          type: common.EFileType.Thumbnail,
          folder: "9ed8414bb27a441cbddb1227870ed038_info_thumbnail",
          filename: "thumbnail1581708282265.png",
          url:
            utils.PORTAL_SUBSET.restUrl +
            "/content/items/ffb0b76754ae4ce497bb4789f3940146/resources/9ed8414bb27a441cbddb1227870ed038_info_thumbnail/thumbnail1581708282265.png"
        }
      ];
      const template: common.IItemTemplate = templates.getItemTemplate(
        "Web Map"
      );

      // tslint:disable-next-line: no-floating-promises
      deploySolution
        ._moveResourcesIntoTemplate(filePaths, template, MOCK_USER_SESSION)
        .then(updatedFilePaths => {
          expect(updatedFilePaths.length).toEqual(0);
          expect(template.item.thumbnail).toBeUndefined();
          expect(template.item.thumbnailurl).toEqual(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/ffb0b76754ae4ce497bb4789f3940146/resources/9ed8414bb27a441cbddb1227870ed038_info_thumbnail/thumbnail1581708282265.png" +
              "?token=fake-token&w=400"
          );
        });
    });
  });

  describe("_getGroupUpdates:: ", () => {
    it("handles template with no groups", () => {
      const shareSpy = spyOn(common, "shareItem").and.resolveTo();
      const tmpl = {} as common.IItemTemplate;
      const td = {};
      // TODO: refactor target function to return a Promise vs an array of promises
      return Promise.all(
        deploySolution._getGroupUpdates(tmpl, MOCK_USER_SESSION, {})
      ).then(() => {
        expect(shareSpy.calls.count()).toBe(
          0,
          "should not make share calls if no groups"
        );
      });
    });
    it("makes sharing calls for all groups", () => {
      const shareSpy = spyOn(common, "shareItem").and.resolveTo();
      const tmpl = {
        groups: ["bc4", "bc5"],
        itemId: "3ef"
      } as common.IItemTemplate;
      const td = {
        bc4: {
          itemId: "bc6"
        },
        bc5: {
          itemId: "bc7"
        }
      };
      // TODO: refactor target function to return a Promise vs an array of promises
      return Promise.all(
        deploySolution._getGroupUpdates(tmpl, MOCK_USER_SESSION, td)
      ).then(() => {
        expect(shareSpy.calls.count()).toBe(2, "should share to both groups");
        expect(shareSpy.calls.argsFor(0)[0]).toBe("bc6");
        expect(shareSpy.calls.argsFor(0)[1]).toBe("3ef");
        expect(shareSpy.calls.argsFor(1)[0]).toBe("bc7");
        expect(shareSpy.calls.argsFor(1)[1]).toBe("3ef");
      });
    });
  });

  describe("_updateTemplateDictionary", () => {
    it("will use initialExtent if fullExtent is not defined", done => {
      const _templates: common.IItemTemplate[] = [];
      const id: string = "ca4a6047326243b290f625e80ebe6531";
      const fsUrl: string =
        "https://services.arcgis.com/orgidFmrV9d1DIvN/arcgis/rest/services/dispatchers2/FeatureServer";

      const fsTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Feature Service",
        [],
        fsUrl
      );

      _templates.push(fsTemplate);

      const templateDictionary: any = {};
      templateDictionary[fsTemplate.itemId] = {
        itemId: id,
        url: fsUrl
      };

      fetchMock.post(fsUrl, {
        serviceItemId: id,
        spatialReference: {
          wkid: 4326
        },
        initialExtent: {
          xmin: 0
        }
      });

      // tslint:disable-next-line: no-empty
      spyOn(common, "getLayerSettings").and.callFake(() => {});

      deploySolution
        ._updateTemplateDictionary(
          _templates,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          expect(templateDictionary).toEqual({
            svc1234567890: {
              itemId: "ca4a6047326243b290f625e80ebe6531",
              url:
                "https://services.arcgis.com/orgidFmrV9d1DIvN/arcgis/rest/services/dispatchers2/FeatureServer",
              defaultSpatialReference: {
                wkid: 4326
              },
              defaultExtent: {
                xmin: 0
              }
            }
          });
          done();
        }, done.fail);
    });

    it("can handle error to fetch feature service", done => {
      const _templates: common.IItemTemplate[] = [];
      const id: string = "ca4a6047326243b290f625e80ebe6531";
      const fsUrl: string =
        "https://services.arcgis.com/orgidFmrV9d1DIvN/arcgis/rest/services/dispatchers2/FeatureServer";

      const fsTemplate: common.IItemTemplate = templates.getItemTemplate(
        "Feature Service",
        [],
        fsUrl
      );

      _templates.push(fsTemplate);

      const templateDictionary: any = {};
      templateDictionary[fsTemplate.itemId] = {
        itemId: id,
        url: fsUrl
      };

      fetchMock.post(fsUrl, mockItems.get400Failure());

      // tslint:disable-next-line: no-empty
      spyOn(common, "getLayerSettings").and.callFake(() => {});

      deploySolution
        ._updateTemplateDictionary(
          _templates,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(done.fail, done);
    });
  });
});

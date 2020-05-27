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
 * Provides tests for functions involving the deployment of a Solution.
 */

import * as testUtils from "../../common/test/mocks/utils";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as fetchMock from "fetch-mock";
import * as templates from "../../common/test/mocks/templates";
import * as common from "@esri/solution-common";
import * as deployUtils from "../src/deployerUtils";
import * as deployer from "../src/deployer";
import * as sinon from "sinon";
import * as deploySolutionFromTemplate from "../src/deploySolutionFromTemplate";
import { cloneObject } from "@esri/hub-common";
import * as postProcessModule from "../src/helpers/post-process";
import M from "minimatch";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = testUtils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

const projectedGeometries: any[] = [
  {
    x: -131,
    y: 16
  },
  {
    x: -57,
    y: 58
  }
];

describe("Module `deployer`", () => {
  afterEach(() => {
    sinon.restore();
  });
  describe("deploy solution orchestration", () => {
    it("should reject if no maybeModel passed", done => {
      return deployer
        .deploySolution(null, MOCK_USER_SESSION)
        .then(_ => {
          fail("deploySolution should reject if passed null");
        })
        .catch(ex => {
          expect(ex).toEqual({
            success: false,
            error: "The Solution Template id is missing"
          });
          done();
        });
    });
    describe("happy pathing", () => {
      if (typeof window !== "undefined") {
        // declare things we want in the `it` fns
        let itemInfo: any;
        let solTmplStub: any;
        let metaStub: any;
        let deployFnStub: any;
        // setup the stubs in before each... ensures they are clean each time
        beforeEach(() => {
          itemInfo = cloneObject(templates.getSolutionTemplateItem([]));
          solTmplStub = sinon
            .stub(deployUtils, "_getSolutionTemplateItem")
            .callsFake((idOrObj, auth) => {
              return Promise.resolve({
                item: itemInfo.item,
                data: itemInfo.data
              });
            });
          // create a fake file
          const xmlFile = new File(["xml"], "metadata.xml", {
            type: "application/xml"
          });
          metaStub = sinon
            .stub(common, "getItemMetadataAsFile")
            .resolves(xmlFile);

          deployFnStub = sinon
            .stub(deploySolutionFromTemplate, "_deploySolutionFromTemplate")
            .resolves("3ef");
        });

        it("ensure main fns are called using stubs", done => {
          // this test assumes all is good and simply checks that
          // the expected delegation occurs
          return deployer
            .deploySolution(itemInfo.item.id, MOCK_USER_SESSION)
            .then(() => {
              expect(solTmplStub.calledOnce).toBe(
                true,
                "_getSolutionTemplateItem should be called"
              );
              expect(metaStub.calledOnce).toBe(
                true,
                "getItemMetadataAsFile should be called once"
              );
              expect(deployFnStub.calledOnce).toBe(
                true,
                "_deploySolutionFromTemplate should be called once"
              );
              // TODO: verify inputs to deployFn
              done();
            })
            .catch(err => {
              fail(err.error);
            });
        });
        it("calls progress callback if passed", done => {
          // create options hash w/ progress callback
          const opts = {
            progressCallback: (pct: number) => pct
          };

          // itemInfo that has not been mutated
          const _itemInfo = cloneObject(templates.getSolutionTemplateItem([]));

          // create stub...
          const pgStub = sinon.stub(opts, "progressCallback");
          return deployer
            .deploySolution(itemInfo.item.id, MOCK_USER_SESSION, opts)
            .then(() => {
              expect(solTmplStub.calledOnce).toBe(
                true,
                "_getSolutionTemplateItem should be called"
              );
              expect(metaStub.calledOnce).toBe(
                true,
                "getItemMetadataAsFile should be called once"
              );
              expect(deployFnStub.calledOnce).toBe(
                true,
                "_deploySolutionFromTemplate should be called once"
              );
              expect(deployFnStub.args[0][0]).toBe(
                _itemInfo.item.id,
                "_deploySolutionFromTemplate should be called with an item id"
              );
              // TODO: verify inputs to deployFn
              expect(pgStub.calledTwice).toBe(
                true,
                "progressCallback should be called twice"
              );
              done();
            })
            .catch(err => {
              fail(err.error);
            });
        });
      }
    });
  });
  describe("deploySolution", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("reports an error if the solution id is not supplied", done => {
        return deployer
          .deploySolution(null, MOCK_USER_SESSION)
          .then(() => done.fail())
          .catch(err => {
            expect(err).toEqual({
              success: false,
              error: "The Solution Template id is missing"
            });
            done();
          });
      });

      it("can deploy webmap with dependencies", done => {
        const groupId: string = "aa4a6047326243b290f625e80ebe6531";
        const newGroupId: string = "ba4a6047326243b290f625e80ebe6531";
        const groupTemplate: common.IItemTemplate = templates.getGroupTemplatePart();
        groupTemplate.itemId = groupId;
        groupTemplate.item.id = "{{" + groupId + ".itemId}}";

        const user: any = testUtils.getContentUser();
        user.groups = [];

        // get templates
        const featureServiceTemplate: any = templates.getItemTemplate(
          "Feature Service"
        );
        featureServiceTemplate.properties.layers[0].someProperty =
          "{{ params.testProperty.value }}";
        const webmapTemplate: any = templates.getItemTemplate(
          "Web Map",
          [featureServiceTemplate.itemId],
          ""
        );
        webmapTemplate.groups = [groupId];
        const itemInfo: any = templates.getSolutionTemplateItem([
          webmapTemplate,
          featureServiceTemplate,
          groupTemplate
        ]);
        itemInfo.item.thumbnail = "thumbnail/ago_downloaded.png";

        itemInfo.data.params = {
          testProperty: {
            value: "ABC",
            type: "Text"
          }
        };

        const templateDictionary: any = {};
        const featureServerAdminUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";
        const featureServerUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer";

        // get mock items
        const layer: any = mockItems.getAGOLLayerOrTable(
          0,
          "ROW Permits",
          "Feature Layer",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleOrigin",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );
        const table: any = mockItems.getAGOLLayerOrTable(
          1,
          "ROW Permit Comment",
          "Table",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleDestination",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );

        const expectedMap: any = mockItems.getTrimmedAGOLItem(
          mockItems.getAGOLItem(
            "Web Map",
            testUtils.PORTAL_SUBSET.portalUrl +
              "/home/webmap/viewer.html?webmap=map1234567890"
          )
        );
        expectedMap.extent = "-88.226,41.708,-88.009,41.844";
        expectedMap.thumbnail =
          testUtils.ORG_URL +
          "/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png";

        const communitySelfResponse: any = testUtils.getUserResponse();
        const portalsSelfResponse: any = testUtils.getPortalsSelfResponse();
        const geometryServer: string =
          portalsSelfResponse.helperServices.geometry.url;

        fetchMock
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890?f=json&token=fake-token",
            mockItems.getAGOLItem(
              "Web Map",
              testUtils.PORTAL_SUBSET.portalUrl +
                "/home/webmap/viewer.html?webmap=map1234567890"
            )
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/self?f=json&token=fake-token",
            communitySelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            testUtils.getUserResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            user
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/groups/" +
              newGroupId +
              "?f=json&token=fake-token",
            mockItems.getAGOLGroup(newGroupId)
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createFolder",
            testUtils.getCreateFolderResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            testUtils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            testUtils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", testUtils.getProjectResponse())
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            testUtils.getSuccessResponse({
              id: "map1234567890",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl + "/community/createGroup",
            testUtils.getCreateGroupResponse(newGroupId)
          )
          .post(testUtils.PORTAL_SUBSET.restUrl + "/search", { results: [] })
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/share",
            testUtils.getShareResponse("map1234567890")
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createService",
            testUtils.getCreateServiceResponse()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/move",
            testUtils.getSuccessResponse({
              itemId: "svc1234567890",
              owner: "casey",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            featureServerAdminUrl + "/addToDefinition",
            testUtils.getSuccessResponse({
              layers: [{ name: "ROW Permits", id: 0 }],
              tables: [{ name: "ROW Permit Comment", id: 1 }]
            })
          )
          .post(featureServerAdminUrl + "/0?f=json", layer)
          .post(featureServerAdminUrl + "/1?f=json", table)
          .post(
            featureServerAdminUrl + "/refresh",
            testUtils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/0/updateDefinition",
            testUtils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/1/updateDefinition",
            testUtils.getSuccessResponse()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/update",
            testUtils.getSuccessResponse({ id: "svc1234567890" })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/update",
            testUtils.getSuccessResponse({ id: "map1234567890" })
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/svc1234567890?f=json&token=fake-token",
            testUtils.getSuccessResponse({ id: "svc1234567890" })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/svc1234567890/data",
            {}
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/map1234567890/data",
            {}
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/sln1234567890/addResources",
            testUtils.getSuccessResponse({ id: "sln1234567890" })
          );
        // tslint:disable-next-line: no-empty
        spyOn(console, "log").and.callFake(() => {});

        const expected: string = "map1234567890";

        delete portalsSelfResponse.portalThumbnail;
        delete portalsSelfResponse.defaultBasemap.baseMapLayers[0].resourceInfo
          .layers[0].subLayerIds;
        delete portalsSelfResponse.portalProperties.sharedTheme.logo.small;
        const expectedTemplate: any = {
          organization: portalsSelfResponse,
          portalBaseUrl: "https://myorg.maps.arcgis.com",
          user: Object.assign({ folders: [] }, testUtils.getUserResponse()),
          solutionItemExtent: "-88.226,41.708,-88.009,41.844", // [[xmin, ymin], [xmax, ymax]]
          folderId: "a4468da125a64526b359b70d8ba4a9dd",
          isPortal: false,
          solutionItemId: "map1234567890",
          svc1234567890: {
            def: {},
            solutionExtent: {
              xmin: -9821384.714217981,
              ymin: 5117339.123090005,
              xmax: -9797228.384715842,
              ymax: 5137789.39951188,
              spatialReference: { wkid: 102100 }
            },
            itemId: "svc1234567890",
            url: featureServerUrl + "/",
            name: "ROWPermits_publiccomment",
            layer0: {
              itemId: "svc1234567890",
              url: featureServerUrl + "/" + 0,
              layerId: "0",
              fields: {
                globalid: {
                  name: "globalid",
                  alias: "globalid",
                  type: "esriFieldTypeGlobalID"
                },
                creationdate: {
                  name: "CreationDate",
                  alias: "CreationDate",
                  type: "esriFieldTypeDate"
                },
                creator: {
                  name: "Creator",
                  alias: "Creator",
                  type: "esriFieldTypeString"
                },
                editdate: {
                  name: "EditDate",
                  alias: "EditDate",
                  type: "esriFieldTypeDate"
                },
                editor: {
                  name: "Editor",
                  alias: "Editor",
                  type: "esriFieldTypeString"
                },
                objectid: {
                  name: "OBJECTID",
                  alias: "OBJECTID",
                  type: "esriFieldTypeOID"
                },
                appname: {
                  name: "appname",
                  alias: "appname",
                  type: "esriFieldTypeString"
                },
                boardreview: {
                  name: "BoardReview",
                  alias: "Board Review",
                  type: "esriFieldTypeString"
                }
              }
            },
            layer1: {
              itemId: "svc1234567890",
              url: featureServerUrl + "/" + 1,
              layerId: "1",
              fields: {
                globalid: {
                  name: "globalid",
                  alias: "globalid",
                  type: "esriFieldTypeGlobalID"
                },
                creationdate: {
                  name: "CreationDate",
                  alias: "CreationDate",
                  type: "esriFieldTypeDate"
                },
                creator: {
                  name: "Creator",
                  alias: "Creator",
                  type: "esriFieldTypeString"
                },
                editdate: {
                  name: "EditDate",
                  alias: "EditDate",
                  type: "esriFieldTypeDate"
                },
                editor: {
                  name: "Editor",
                  alias: "Editor",
                  type: "esriFieldTypeString"
                },
                objectid: {
                  name: "OBJECTID",
                  alias: "OBJECTID",
                  type: "esriFieldTypeOID"
                },
                appname: {
                  name: "appname",
                  alias: "appname",
                  type: "esriFieldTypeString"
                },
                boardreview: {
                  name: "BoardReview",
                  alias: "Board Review",
                  type: "esriFieldTypeString"
                }
              }
            }
          },
          map1234567890: {
            itemId: "map1234567890"
          },
          params: {
            testProperty: {
              value: "ABC",
              type: "Text"
            }
          }
        };
        expectedTemplate[groupId] = {
          itemId: newGroupId
        };

        const expectedUpdateBody: string =
          "f=json&id=map1234567890&url=https%3A%2F%2Fmyorg.maps.arcgis.com%2Fhome%2Fwebmap%2Fviewer.html%3Fwebmap%3Dmap1234567890&token=fake-token";

        const options: common.IDeploySolutionOptions = {
          templateDictionary: templateDictionary,
          progressCallback: testUtils.SOLUTION_PROGRESS_CALLBACK,
          consoleProgress: true
        };
        deployer
          .deploySolution(itemInfo.item.id, MOCK_USER_SESSION, options)
          .then(
            function(actual) {
              // not concerned with the def here
              templateDictionary["svc1234567890"].def = {};

              expect(templateDictionary)
                .withContext("test templateDictionary === expectedTemplate")
                .toEqual(expectedTemplate);
              expect(actual)
                .withContext("test actual === expected")
                .toEqual(expected);

              const addToDefCalls: any[] = fetchMock.calls(/addToDefinition/);
              const customParams = /someProperty%22%3A%22ABC/.test(
                JSON.stringify(addToDefCalls[0][1].body)
              );
              expect(customParams)
                .withContext("test that we have custom params")
                .toBeTrue();

              const updateCalls: any[] = fetchMock.calls(
                testUtils.PORTAL_SUBSET.restUrl +
                  "/content/users/casey/items/map1234567890/update"
              );

              const actualUpdateBody = updateCalls[0][1].body;
              expect(actualUpdateBody === expectedUpdateBody)
                .withContext("test the expected update body")
                .toBeTruthy();

              // Repeat with progress callback
              options.progressCallback = testUtils.SOLUTION_PROGRESS_CALLBACK;
              options.templateDictionary = {};
              deployer
                .deploySolution(itemInfo.item.id, MOCK_USER_SESSION, options)
                .then(done, e => {
                  done.fail(e);
                });
            },
            e => {
              done.fail(e);
            }
          );
      });

      it("can handle error on postProcess", done => {
        const itemInfoCard: any = {
          id: "c38e59126368495694ca23b7ccacefba",
          title: "Election Management",
          description: "",
          url:
            testUtils.PORTAL_SUBSET.portalUrl +
            "/home/item.html?id=c38e59126368495694ca23b7ccacefba",
          thumbnailurl:
            testUtils.PORTAL_SUBSET.restUrl +
            "/content/items/c38e59126368495694ca23b7ccacefba/info/thumbnail/ago_downloaded_orig.png",
          tryitUrl: "",
          created: 1578000306000,
          tags: [
            "deploy.commonid.00292a52-00b7-4719-00e4-163c008d16b2",
            "Government",
            "deploy.solution",
            "deploy.version.2.0"
          ],
          categories: [],
          deployCommonId: "00292a52-00b7-4719-00e4-163c008d16b2",
          deployVersion: 2
        };
        const templateDictionary: any = {};

        const solutionResponse: any = {
          metadata: {},
          templates: [
            {
              itemId: "cc2ccab401af4828a25cc6eaeb59fb69",
              type: "Workforce Project",
              key: "hvzg0293",
              item: {
                id: "{{cc2ccab401af4828a25cc6eaeb59fb69.itemId}}",
                type: "Workforce Project",
                accessInformation: "Esri",
                categories: [],
                culture: "en-us",
                description:
                  "A Workforce for ArcGIS Project used by elections staff to manage election day requests for assistance and track the resolution of each request.",
                extent: "{{solutionItemExtent}}",
                licenseInfo: null,
                name: null,
                snippet:
                  "A Workforce for ArcGIS Project used by elections staff to manage election day requests for assistance and track the resolution of each request.",
                tags: [
                  "Elections",
                  "Voting",
                  "Precincts",
                  "Elected Officials",
                  "Ballots",
                  "Secretary of State",
                  "Polling Places",
                  "Early Voting",
                  "Voting Centers",
                  "Election Day",
                  "Election Officials",
                  "Clerks"
                ],
                thumbnail: "thumbnail/thumbnail1552919935720.png",
                title: "Election Manager",
                typeKeywords: [
                  "source-e4f57a8460b14b46a54e4519325f5ded",
                  "Workforce Project"
                ],
                url: null
              },
              data: {
                version: "1.2.0",
                workerWebMapId: "{{b95616555b16437f8435e079033128d0.itemId}}",
                dispatcherWebMapId:
                  "{{7d4b6a244163430590151395821fb845.itemId}}",
                assignments: {
                  serviceItemId:
                    "{{2860494043c3459faabcfd0e1ab557fc.layer0.itemId}}",
                  url: "{{2860494043c3459faabcfd0e1ab557fc.layer0.url}}"
                },
                workers: {
                  serviceItemId:
                    "{{bf4bdd4bdd18437f8d5ff1aa2d25fd7c.layer0.itemId}}",
                  url: "{{bf4bdd4bdd18437f8d5ff1aa2d25fd7c.layer0.url}}"
                },
                tracks: {
                  serviceItemId:
                    "{{5e514329e69144c59f69f3f3e0d45269.layer0.itemId}}",
                  url: "{{5e514329e69144c59f69f3f3e0d45269.layer0.url}}",
                  enabled: true,
                  updateInterval: 300
                },
                groupId: "{{47bb15c2df2b466da05577776e82d044.itemId}}",
                folderId: "{{folderId}}",
                assignmentIntegrations: [
                  {
                    id: "default-navigator",
                    prompt: "Navigate to Assignment",
                    urlTemplate:
                      "arcgis-navigator://?stop=${assignment.latitude},${assignment.longitude}&stopname=${assignment.location}&callback=arcgis-workforce://&callbackprompt=Workforce"
                  }
                ]
              },
              resources: [
                "cc2ccab401af4828a25cc6eaeb59fb69_info_thumbnail/thumbnail1552919935720.png"
              ],
              dependencies: ["47bb15c2df2b466da05577776e82d044"],
              properties: {},
              estimatedDeploymentCostFactor: 2,
              groups: ["47bb15c2df2b466da05577776e82d044"]
            },
            {
              itemId: "47bb15c2df2b466da05577776e82d044",
              type: "Group",
              key: "fqyriu7r",
              item: {
                id: "{{47bb15c2df2b466da05577776e82d044.itemId}}",
                description:
                  "A group used in the Election Manager Workforce for ArcGIS project to access Election Manager maps and applications.",
                snippet:
                  "A group used in the Election Manager Workforce for ArcGIS project to access Election Manager maps and applications.",
                tags: [
                  "Elections",
                  "Voting",
                  "Precincts",
                  "Elected Officials",
                  "Ballots",
                  "Secretary of State",
                  "Polling Places",
                  "Early Voting",
                  "Voting Centers"
                ],
                thumbnail: "thumbnail1552923181520.png",
                title: "Election Manager",
                isInvitationOnly: true,
                owner: "LocalGovDeployment",
                phone: null,
                sortField: "title",
                sortOrder: "asc",
                isViewOnly: true,
                created: 1552507358000,
                modified: 1553043489000,
                access: "public",
                capabilities: [],
                isFav: false,
                isReadOnly: false,
                protected: true,
                autoJoin: false,
                notificationsEnabled: false,
                provider: null,
                providerGroupName: null,
                leavingDisallowed: false,
                hiddenMembers: false,
                displaySettings: {
                  itemTypes: ""
                },
                userMembership: {
                  username: "casey",
                  memberType: "none"
                },
                collaborationInfo: {}
              },
              data: {},
              resources: [
                "47bb15c2df2b466da05577776e82d044_info_thumbnail/thumbnail1552923181520.png"
              ],
              dependencies: [],
              properties: {},
              estimatedDeploymentCostFactor: 2,
              groups: []
            }
          ]
        };

        const folderId: string = "bd610311e0e84e41b96f54df2da54f82";
        const imageUrl: string =
          testUtils.PORTAL_SUBSET.restUrl +
          "/content/items/c38e59126368495694ca23b7ccacefba/resources/cc2ccab401af4828a25cc6eaeb59fb69_info_thumbnail/thumbnail1552919935720.png";
        const imageUrl2: string =
          testUtils.PORTAL_SUBSET.restUrl +
          "/content/items/c38e59126368495694ca23b7ccacefba/resources/47bb15c2df2b466da05577776e82d044_info_thumbnail/thumbnail1552923181520.png";
        const expectedImage = mockItems.getAnImageResponse();

        const communitySelfResponse: any = testUtils.getUserResponse();
        const portalsSelfResponse: any = testUtils.getPortalsSelfResponse();
        const geometryServer: string =
          portalsSelfResponse.helperServices.geometry.url;

        fetchMock
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/c38e59126368495694ca23b7ccacefba/data",
            solutionResponse
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/c38e59126368495694ca23b7ccacefba/info/metadata/metadata.xml",
            testUtils.getSampleMetadataAsFile(),
            { sendAsJson: false }
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/c38e59126368495694ca23b7ccacefba?f=json&token=fake-token",
            itemInfoCard
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/org1234567890?f=json&token=fake-token",
            testUtils.getPortalsSelfResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/self?f=json&token=fake-token",
            communitySelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            testUtils.getPortalsSelfResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            testUtils.getUserResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            []
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createFolder",
            testUtils.getCreateFolderResponse(folderId)
          )
          .post(imageUrl, expectedImage)
          .post(imageUrl2, expectedImage)
          .post(
            geometryServer + "/findTransformations",
            testUtils.getTransformationsResponse()
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
              id: "57a059ec717c4b1282705132fd4720a0",
              folder: folderId
            }),
            { overwriteRoutes: false }
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/" +
              folderId +
              "/addItem",
            testUtils.getSuccessResponse({
              id: "82601685fd3c444397d252116d7a3dc0",
              folder: folderId
            }),
            { overwriteRoutes: false }
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl + "/community/createGroup",
            testUtils.getSuccessResponse({
              group: { id: "987eaa6a496546a58f04796266589ec5" }
            })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/groups/987eaa6a496546a58f04796266589ec5/update",
            testUtils.getSuccessResponse({
              groupId: "987eaa6a496546a58f04796266589ec5"
            })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/57a059ec717c4b1282705132fd4720a0/update",
            testUtils.getSuccessResponse({
              id: "57a059ec717c4b1282705132fd4720a0"
            })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/82601685fd3c444397d252116d7a3dc0/update",
            testUtils.getSuccessResponse({
              id: "82601685fd3c444397d252116d7a3dc0"
            })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/bd610311e0e84e41b96f54df2da54f82/delete",
            testUtils.getSuccessResponse({
              folder: { username: "casey", id: folderId }
            })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/57a059ec717c4b1282705132fd4720a0/delete",
            testUtils.getSuccessResponse({
              itemId: "57a059ec717c4b1282705132fd4720a0"
            })
          );

        spyOn(postProcessModule, "postProcess").and.callFake(() =>
          Promise.reject()
        );

        const options: common.IDeploySolutionOptions = {
          templateDictionary: templateDictionary
        };

        deployer
          .deploySolution(itemInfoCard.id, MOCK_USER_SESSION, options)
          .then(() => {
            done.fail();
          }, done);
      });

      it("can handle error on createItemWithData", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplate("Feature Service")
        ]);

        const communitySelfResponse: any = testUtils.getUserResponse();
        const portalsSelfResponse: any = testUtils.getPortalsSelfResponse();
        const geometryServer: string =
          portalsSelfResponse.helperServices.geometry.url;

        fetchMock
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/self?f=json&token=fake-token",
            communitySelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            testUtils.getUserResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            testUtils.getContentUser()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createFolder",
            testUtils.getCreateFolderResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            testUtils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            testUtils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", testUtils.getProjectResponse())
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            mockItems.get200Failure()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/delete",
            testUtils.getSuccessResponse({
              folder: {
                username: "casey",
                id: "a4468da125a64526b359b70d8ba4a9dd"
              }
            })
          );

        deployer.deploySolution(itemInfo.item.id, MOCK_USER_SESSION).then(
          () => {
            done.fail();
          },
          () => {
            done();
          }
        );
      });

      it("can handle error on get solution item", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplate("Feature Service")
        ]);

        const communitySelfResponse: any = testUtils.getUserResponse();
        const portalsSelfResponse: any = testUtils.getPortalsSelfResponse();

        fetchMock
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/self?f=json&token=fake-token",
            communitySelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            testUtils.getUserResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            testUtils.getContentUser()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createFolder",
            testUtils.getCreateFolderResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            mockItems.get400Failure()
          );

        const options: common.IDeploySolutionOptions = {
          progressCallback: testUtils.SOLUTION_PROGRESS_CALLBACK
        };
        deployer
          .deploySolution(itemInfo.item.id, MOCK_USER_SESSION, options)
          .then(
            () => {
              done.fail();
            },
            () => {
              done();
            }
          );
      });

      it("can handle error on project", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplate("Feature Service")
        ]);

        const communitySelfResponse: any = testUtils.getUserResponse();
        const portalsSelfResponse: any = testUtils.getPortalsSelfResponse();
        const geometryServer: string =
          portalsSelfResponse.helperServices.geometry.url;

        fetchMock
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/self?f=json&token=fake-token",
            communitySelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            testUtils.getUserResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            testUtils.getContentUser()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createFolder",
            testUtils.getCreateFolderResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            testUtils.UTILITY_SERVER_INFO
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .post(
            geometryServer + "/findTransformations",
            testUtils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", mockItems.get400Failure());

        const options: common.IDeploySolutionOptions = {
          progressCallback: testUtils.SOLUTION_PROGRESS_CALLBACK
        };
        deployer
          .deploySolution(itemInfo.item.id, MOCK_USER_SESSION, options)
          .then(
            () => {
              done.fail();
            },
            () => {
              done();
            }
          );
      });

      it("can handle error on updateItem", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplate("Feature Service")
        ]);

        const featureServerAdminUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

        // get mock items
        const layer: any = mockItems.getAGOLLayerOrTable(
          0,
          "ROW Permits",
          "Feature Layer",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleOrigin",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );
        const table: any = mockItems.getAGOLLayerOrTable(
          1,
          "ROW Permit Comment",
          "Table",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleDestination",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );

        const communitySelfResponse: any = testUtils.getUserResponse();
        const portalsSelfResponse: any = testUtils.getPortalsSelfResponse();
        portalsSelfResponse.urlKey = null;
        const geometryServer: string =
          portalsSelfResponse.helperServices.geometry.url;

        fetchMock
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/self?f=json&token=fake-token",
            communitySelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            testUtils.getUserResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            testUtils.getContentUser()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createFolder",
            testUtils.getCreateFolderResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            testUtils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            testUtils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", testUtils.getProjectResponse())
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            testUtils.getSuccessResponse({
              id: "map1234567890",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createService",
            testUtils.getCreateServiceResponse()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/move",
            testUtils.getSuccessResponse({
              itemId: "svc1234567890",
              owner: "casey",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            featureServerAdminUrl + "/addToDefinition",
            testUtils.getSuccessResponse({
              layers: [{ name: "ROW Permits", id: 0 }],
              tables: [{ name: "ROW Permit Comment", id: 1 }]
            })
          )
          .post(featureServerAdminUrl + "/0?f=json", layer)
          .post(featureServerAdminUrl + "/1?f=json", table)
          .post(
            featureServerAdminUrl + "/refresh",
            testUtils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/0/updateDefinition",
            testUtils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/1/updateDefinition",
            testUtils.getSuccessResponse()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/update",
            testUtils.getSuccessResponse({ id: "svc1234567890" })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/svc1234567890/data",
            {}
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/update",
            mockItems.get400Failure()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/delete",
            testUtils.getSuccessResponse({
              folder: {
                username: "casey",
                id: "a4468da125a64526b359b70d8ba4a9dd"
              }
            })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/delete",
            testUtils.getSuccessResponse({ itemId: "map1234567890" })
          );

        const options: common.IDeploySolutionOptions = {
          title: "a title",
          snippet: "a snippet",
          description: "a description",
          tags: ["a tag"],
          thumbnailurl: "a thumbnailurl",
          templateDictionary: null,
          additionalTypeKeywords: ["UnitTest"],
          progressCallback: testUtils.SOLUTION_PROGRESS_CALLBACK
        };
        deployer
          .deploySolution(itemInfo.item.id, MOCK_USER_SESSION, options)
          .then(
            () => {
              done.fail();
            },
            () => {
              done();
            }
          );
      });

      it("can handle error on deploySolutionItems update", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplate("Feature Service")
        ]);

        const featureServerAdminUrl: string =
          "https://services123.arcgis.com/org1234567890/arcgis/rest/admin/services/ROWPermits_publiccomment/FeatureServer";

        // get mock items
        const layer: any = mockItems.getAGOLLayerOrTable(
          0,
          "ROW Permits",
          "Feature Layer",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleOrigin",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );
        const table: any = mockItems.getAGOLLayerOrTable(
          1,
          "ROW Permit Comment",
          "Table",
          [
            {
              id: 0,
              name: "",
              relatedTableId: 1,
              cardinality: "esriRelCardinalityOneToMany",
              role: "esriRelRoleDestination",
              "": "globalid",
              composite: true,
              keyField: "globalid"
            }
          ],
          true
        );

        const communitySelfResponse: any = testUtils.getUserResponse();
        const portalsSelfResponse: any = testUtils.getPortalsSelfResponse();
        const geometryServer: string =
          portalsSelfResponse.helperServices.geometry.url;

        fetchMock
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/self?f=json&token=fake-token",
            communitySelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            testUtils.getUserResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            testUtils.getContentUser()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createFolder",
            testUtils.getCreateFolderResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            testUtils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            testUtils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", testUtils.getProjectResponse())
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            testUtils.getSuccessResponse({
              id: "map1234567890",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createService",
            testUtils.getCreateServiceResponse()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/move",
            testUtils.getSuccessResponse({
              itemId: "svc1234567890",
              owner: "casey",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            featureServerAdminUrl + "/addToDefinition",
            testUtils.getSuccessResponse({
              layers: [{ name: "ROW Permits", id: 0 }],
              tables: [{ name: "ROW Permit Comment", id: 1 }]
            })
          )
          .post(featureServerAdminUrl + "/0?f=json", layer)
          .post(featureServerAdminUrl + "/1?f=json", table)
          .post(
            featureServerAdminUrl + "/refresh",
            testUtils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/0/updateDefinition",
            testUtils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/1/updateDefinition",
            testUtils.getSuccessResponse()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/update",
            mockItems.get400Failure()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/delete",
            testUtils.getSuccessResponse({ itemId: "svc1234567890" })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/groups/svc1234567890/delete",
            testUtils.getSuccessResponse({ groupId: "svc1234567890" })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/delete",
            testUtils.getFailureResponse({
              folder: {
                username: "casey",
                id: "a4468da125a64526b359b70d8ba4a9dd"
              }
            })
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/delete",
            testUtils.getSuccessResponse({ itemId: "map1234567890" })
          );

        const options: common.IDeploySolutionOptions = {
          progressCallback: testUtils.SOLUTION_PROGRESS_CALLBACK
        };
        deployer
          .deploySolution(itemInfo.item.id, MOCK_USER_SESSION, options)
          .then(
            () => {
              done.fail();
            },
            () => {
              done();
            }
          );
      });

      it("can handle error on create Folder", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplate("Feature Service")
        ]);

        const communitySelfResponse: any = testUtils.getUserResponse();
        const portalsSelfResponse: any = testUtils.getPortalsSelfResponse();
        const geometryServer: string =
          portalsSelfResponse.helperServices.geometry.url;

        fetchMock
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .post(geometryServer + "/findTransformations/rest/info", "{}")
          .post(
            geometryServer + "/findTransformations",
            testUtils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", {
            geometries: projectedGeometries
          })
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/self?f=json&token=fake-token",
            communitySelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalsSelfResponse
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            testUtils.getUserResponse()
          )
          .get(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            testUtils.getContentUser()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/info/metadata/metadata.xml",
            mockItems.get400Failure()
          )
          .post(
            testUtils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/createFolder",
            mockItems.get400Failure()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            testUtils.UTILITY_SERVER_INFO
          );

        const options: common.IDeploySolutionOptions = {
          progressCallback: testUtils.SOLUTION_PROGRESS_CALLBACK
        };
        deployer
          .deploySolution(itemInfo.item.id, MOCK_USER_SESSION, options)
          .then(
            () => {
              done.fail();
            },
            () => {
              done();
            }
          );
      });
    }
  });
});

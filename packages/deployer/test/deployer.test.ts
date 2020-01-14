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

import * as utils from "../../common/test/mocks/utils";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as fetchMock from "fetch-mock";
import * as templates from "../../common/test/mocks/templates";
import * as common from "@esri/solution-common";
import * as deployer from "../src/deployer";
import * as deployItems from "../src/deploySolutionItems";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: common.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession(new Date().getDate());
});

describe("Module `deploySolution`", () => {
  describe("deploySolution", () => {
    // Blobs are only available in the browser
    if (typeof window !== "undefined") {
      it("can deploy webmap with dependencies", done => {
        // get templates
        const featureServiceTemplate: any = templates.getItemTemplatePart(
          "Feature Service"
        );
        const webmapTemplate: any = templates.getItemTemplatePart(
          "Web Map",
          [featureServiceTemplate.itemId],
          ""
        );
        const itemInfo: any = templates.getSolutionTemplateItem([
          webmapTemplate,
          featureServiceTemplate
        ]);

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
            "https://myorg.maps.arcgis.com/home/webmap/viewer.html?webmap=map1234567890"
          )
        );
        expectedMap.extent = "-88.226,41.708,-88.009,41.844";
        expectedMap.thumbnail =
          utils.ORG_URL +
          "/sharing/rest/content/items/map1234567890/info/thumbnail/ago_downloaded.png";

        const portalResponse: any = utils.getPortalResponse();
        const geometryServer: string =
          portalResponse.helperServices.geometry.url;

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            utils.getContentUser()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", utils.getProjectResponse())
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            utils.getSuccessResponse({
              id: "map1234567890",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
            utils.getCreateServiceResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/move",
            utils.getSuccessResponse({
              itemId: "svc1234567890",
              owner: "casey",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            featureServerAdminUrl + "/addToDefinition",
            utils.getSuccessResponse({
              layers: [{ name: "ROW Permits", id: 0 }],
              tables: [{ name: "ROW Permit Comment", id: 1 }]
            })
          )
          .post(featureServerAdminUrl + "/0?f=json", layer)
          .post(featureServerAdminUrl + "/1?f=json", table)
          .post(featureServerAdminUrl + "/refresh", utils.getSuccessResponse())
          .post(
            featureServerAdminUrl + "/0/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/1/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/update",
            utils.getSuccessResponse({ id: "svc1234567890" })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/update",
            utils.getSuccessResponse({ id: "map1234567890" })
          );

        const expected: any = {
          item: {
            id: "map1234567890",
            type: "Solution",
            name: null,
            title: "title",
            typeKeywords: ["Solution", "Deployed"],
            url: "https://www.arcgis.com/home/item.html?id=map1234567890",
            thumbnailUrl: undefined,
            tryitUrl: undefined
          },
          data: {
            metadata: {
              version: "x",
              resourceStorageItemId: "sln1234567890"
            },
            templates: [
              {
                itemId: "map1234567890",
                type: "Web Map",
                dependencies: ["svc1234567890"],
                circularDependencies: []
              },
              {
                itemId: "svc1234567890",
                type: "Feature Service",
                dependencies: [],
                circularDependencies: []
              }
            ]
          }
        };

        delete portalResponse.portalThumbnail;
        delete portalResponse.defaultBasemap.baseMapLayers[0].resourceInfo
          .layers[0].subLayerIds;
        delete portalResponse.portalProperties.sharedTheme.logo.small;
        const expectedTemplate: any = {
          organization: portalResponse,
          portalBaseUrl: "https://myorg.maps.arcgis.com",
          user: Object.assign({ folders: [] }, utils.getUserResponse()),
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
            url: featureServerUrl,
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
          }
        };

        const options: common.IDeploySolutionOptions = {
          templateDictionary: templateDictionary
        };
        deployer
          .deploySolution(itemInfo.item.id, MOCK_USER_SESSION, options)
          .then(
            function(actual) {
              // not concerened with the def here
              templateDictionary["svc1234567890"].def = {};
              expect(templateDictionary).toEqual(expectedTemplate);
              expect(actual).toEqual(expected);

              // Repeat with progress callback
              options.progressCallback = utils.PROGRESS_CALLBACK;
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

      it("can handle error on postProcessCircularDependencies", done => {
        const itemInfoCard: any = {
          id: "c38e59126368495694ca23b7ccacefba",
          title: "Election Management_JH",
          snippet: "",
          description: "",
          url:
            "https://www.arcgis.com/home/item.html?id=c38e59126368495694ca23b7ccacefba",
          thumbnailUrl:
            "https://www.arcgis.com/sharing/rest/content/items/c38e59126368495694ca23b7ccacefba/info/thumbnail/ago_downloaded_orig.png",
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
        const portalSubset: any = {
          name: "ArcGIS for Local Government Deployment",
          id: "org1234567890",
          restUrl: "https://www.arcgis.com/sharing/rest",
          portalUrl: "https://www.arcgis.com",
          urlKey: "localdeployment"
        };

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
                extent: [],
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
              dependencies: [],
              properties: {},
              estimatedDeploymentCostFactor: 2,
              circularDependencies: ["47bb15c2df2b466da05577776e82d044"]
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
              circularDependencies: ["cc2ccab401af4828a25cc6eaeb59fb69"]
            }
          ]
        };

        const folderId: string = "bd610311e0e84e41b96f54df2da54f82";
        const imageUrl: string =
          "https://www.arcgis.com/sharing/rest/content/items/c38e59126368495694ca23b7ccacefba/resources/cc2ccab401af4828a25cc6eaeb59fb69_info_thumbnail/thumbnail1552919935720.png";
        const imageUrl2: string =
          "https://www.arcgis.com/sharing/rest/content/items/c38e59126368495694ca23b7ccacefba/resources/47bb15c2df2b466da05577776e82d044_info_thumbnail/thumbnail1552923181520.png";
        const expectedImage = mockItems.getAnImageResponse();

        fetchMock
          .post(
            portalSubset.restUrl +
              "/content/items/c38e59126368495694ca23b7ccacefba/data",
            solutionResponse
          )
          .get(
            portalSubset.restUrl +
              "/content/items/c38e59126368495694ca23b7ccacefba?f=json",
            itemInfoCard
          )
          .get(
            portalSubset.restUrl + "/portals/org1234567890?f=json",
            utils.getPortalResponse()
          )
          .get(
            "https://www.arcgis.com/sharing/rest/portals/self?f=json",
            utils.getPortalResponse()
          )
          .get(
            portalSubset.restUrl + "/community/users/casey?f=json",
            utils.getUserResponse()
          )
          .get(portalSubset.restUrl + "/content/users/casey?f=json", [])
          .post(
            portalSubset.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse(folderId)
          )
          .post(imageUrl, expectedImage)
          .post(imageUrl2, expectedImage)
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer/project",
            utils.getProjectResponse()
          )
          .post(
            portalSubset.restUrl +
              "/content/users/casey/" +
              folderId +
              "/addItem",
            utils.getSuccessResponse({
              id: "57a059ec717c4b1282705132fd4720a0",
              folder: folderId
            }),
            { overwriteRoutes: false }
          )
          .post(
            portalSubset.restUrl +
              "/content/users/casey/" +
              folderId +
              "/addItem",
            utils.getSuccessResponse({
              id: "82601685fd3c444397d252116d7a3dc0",
              folder: folderId
            }),
            { overwriteRoutes: false }
          )
          .post(
            portalSubset.restUrl + "/community/createGroup",
            utils.getSuccessResponse({
              group: { id: "987eaa6a496546a58f04796266589ec5" }
            })
          )
          .post(
            portalSubset.restUrl +
              "/community/groups/987eaa6a496546a58f04796266589ec5/update",
            utils.getSuccessResponse({
              groupId: "987eaa6a496546a58f04796266589ec5"
            })
          )
          .post(
            portalSubset.restUrl +
              "/content/users/casey/items/57a059ec717c4b1282705132fd4720a0/update",
            utils.getSuccessResponse({ id: "57a059ec717c4b1282705132fd4720a0" })
          )
          .post(
            portalSubset.restUrl +
              "/content/users/casey/items/82601685fd3c444397d252116d7a3dc0/update",
            utils.getSuccessResponse({ id: "82601685fd3c444397d252116d7a3dc0" })
          );

        spyOn(deployItems, "postProcessCircularDependencies").and.callFake(() =>
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
          templates.getItemTemplatePart("Feature Service")
        ]);

        const portalResponse: any = utils.getPortalResponse();
        const geometryServer: string =
          portalResponse.helperServices.geometry.url;

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            utils.getContentUser()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", utils.getProjectResponse())
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            mockItems.get200Failure()
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
          templates.getItemTemplatePart("Feature Service")
        ]);

        const portalResponse: any = utils.getPortalResponse();

        fetchMock
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            utils.getContentUser()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            mockItems.get400Failure()
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

      it("can handle error on project", done => {
        // get templates
        const itemInfo: any = templates.getSolutionTemplateItem([
          templates.getItemTemplatePart("Feature Service")
        ]);

        const portalResponse: any = utils.getPortalResponse();
        const geometryServer: string =
          portalResponse.helperServices.geometry.url;

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            utils.getContentUser()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", mockItems.get400Failure());

        const options: common.IDeploySolutionOptions = {
          progressCallback: utils.PROGRESS_CALLBACK
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
          templates.getItemTemplatePart("Feature Service")
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

        const portalResponse: any = utils.getPortalResponse();
        portalResponse.urlKey = null;
        const geometryServer: string =
          portalResponse.helperServices.geometry.url;

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            utils.getContentUser()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", utils.getProjectResponse())
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            utils.getSuccessResponse({
              id: "map1234567890",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
            utils.getCreateServiceResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/move",
            utils.getSuccessResponse({
              itemId: "svc1234567890",
              owner: "casey",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            featureServerAdminUrl + "/addToDefinition",
            utils.getSuccessResponse({
              layers: [{ name: "ROW Permits", id: 0 }],
              tables: [{ name: "ROW Permit Comment", id: 1 }]
            })
          )
          .post(featureServerAdminUrl + "/0?f=json", layer)
          .post(featureServerAdminUrl + "/1?f=json", table)
          .post(featureServerAdminUrl + "/refresh", utils.getSuccessResponse())
          .post(
            featureServerAdminUrl + "/0/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/1/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/update",
            utils.getSuccessResponse({ id: "svc1234567890" })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/map1234567890/update",
            mockItems.get400Failure()
          );

        const options: common.IDeploySolutionOptions = {
          title: "a title",
          snippet: "a snippet",
          description: "a description",
          tags: ["a tag"],
          thumbnailUrl: "a thumbnailUrl",
          templateDictionary: null,
          additionalTypeKeywords: null,
          progressCallback: utils.PROGRESS_CALLBACK
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
          templates.getItemTemplatePart("Feature Service")
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

        const portalResponse: any = utils.getPortalResponse();
        const geometryServer: string =
          portalResponse.helperServices.geometry.url;

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            utils.getContentUser()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            utils.getCreateFolderResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          )
          .post(
            geometryServer + "/findTransformations",
            utils.getTransformationsResponse()
          )
          .post(geometryServer + "/project", utils.getProjectResponse())
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/a4468da125a64526b359b70d8ba4a9dd/addItem",
            utils.getSuccessResponse({
              id: "map1234567890",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createService",
            utils.getCreateServiceResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/move",
            utils.getSuccessResponse({
              itemId: "svc1234567890",
              owner: "casey",
              folder: "44468da125a64526b359b70d8ba4a9dd"
            })
          )
          .post(
            featureServerAdminUrl + "/addToDefinition",
            utils.getSuccessResponse({
              layers: [{ name: "ROW Permits", id: 0 }],
              tables: [{ name: "ROW Permit Comment", id: 1 }]
            })
          )
          .post(featureServerAdminUrl + "/0?f=json", layer)
          .post(featureServerAdminUrl + "/1?f=json", table)
          .post(featureServerAdminUrl + "/refresh", utils.getSuccessResponse())
          .post(
            featureServerAdminUrl + "/0/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            featureServerAdminUrl + "/1/updateDefinition",
            utils.getSuccessResponse()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey/items/svc1234567890/update",
            mockItems.get400Failure()
          );

        const options: common.IDeploySolutionOptions = {
          progressCallback: utils.PROGRESS_CALLBACK
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
          templates.getItemTemplatePart("Feature Service")
        ]);

        const portalResponse: any = utils.getPortalResponse();

        fetchMock
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "?f=json&token=fake-token",
            itemInfo.item
          )
          .post(
            utils.PORTAL_SUBSET.restUrl +
              "/content/items/" +
              itemInfo.item.id +
              "/data",
            itemInfo.data
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/self?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/portals/abCDefG123456?f=json&token=fake-token",
            portalResponse
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/community/users/casey?f=json&token=fake-token",
            utils.getUserResponse()
          )
          .get(
            utils.PORTAL_SUBSET.restUrl +
              "/content/users/casey?f=json&token=fake-token",
            utils.getContentUser()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/content/users/casey/createFolder",
            mockItems.get400Failure()
          )
          .post(
            utils.PORTAL_SUBSET.restUrl + "/generateToken",
            utils.getTokenResponse()
          )
          .post(
            "https://utility.arcgisonline.com/arcgis/rest/info",
            utils.UTILITY_SERVER_INFO
          );

        const options: common.IDeploySolutionOptions = {
          progressCallback: utils.PROGRESS_CALLBACK
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

  describe("_checkedReplaceAll", () => {
    it("_checkedReplaceAll no template", () => {
      const template: string = null;
      const oldValue = "onm";
      const newValue = "ONM";
      const expectedResult = template;

      const actualResult = deployer._checkedReplaceAll(
        template,
        oldValue,
        newValue
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it("_checkedReplaceAll no matches", () => {
      const template = "abcdefghijklmnopqrstuvwxyz";
      const oldValue = "onm";
      const newValue = "ONM";
      const expectedResult = template;

      const actualResult = deployer._checkedReplaceAll(
        template,
        oldValue,
        newValue
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it("_checkedReplaceAll one match", () => {
      const template = "abcdefghijklmnopqrstuvwxyz";
      const oldValue = "mno";
      const newValue = "MNO";
      const expectedResult = "abcdefghijklMNOpqrstuvwxyz";

      const actualResult = deployer._checkedReplaceAll(
        template,
        oldValue,
        newValue
      );
      expect(actualResult).toEqual(expectedResult);
    });

    it("_checkedReplaceAll two matches", () => {
      const template = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
      const oldValue = "mno";
      const newValue = "MNO";
      const expectedResult =
        "abcdefghijklMNOpqrstuvwxyzabcdefghijklMNOpqrstuvwxyz";

      const actualResult = deployer._checkedReplaceAll(
        template,
        oldValue,
        newValue
      );
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe("_estimateDeploymentCost", () => {
    xit("_estimateDeploymentCost", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
  });
});

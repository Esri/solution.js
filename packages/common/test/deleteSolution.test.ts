/** @license
 * Copyright 2021 Esri
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
 * Provides tests for functions for deleting a deployed Solution item and all of the items that were created
 * as part of that deployment.
 */

import * as createHRO from "../src/create-hub-request-options";
import * as deleteSolution from "../src/deleteSolution";
import * as hubSites from "@esri/hub-sites";
import * as interfaces from "../src/interfaces";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as portal from "@esri/arcgis-rest-portal";
import * as restHelpers from "../src/restHelpers";
import * as restHelpersGet from "../src/restHelpersGet";
import * as utils from "./mocks/utils";
import * as getDeletableSolutionInfo from "../src/getDeletableSolutionInfo";
import * as getSolutionSummary from "../src/getSolutionSummary";
import * as deleteSolutionFolder from "../src/deleteHelpers/deleteSolutionFolder";
import * as removeItems from "../src/deleteHelpers/removeItems";
import * as reportProgress from "../src/deleteHelpers/reportProgress";
import * as reconstructBuildOrderIds from "../src/deleteHelpers/reconstructBuildOrderIds";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `deleteSolution`: functions for deleting a deployed Solution item and all of its items", () => {
  describe("deleteSolution", () => {
    it("rejects a Solution template", done => {
      const testItem = "sol1234567890";
      const getDeletableSolutionInfoSpy = spyOn(
        getDeletableSolutionInfo,
        "getDeletableSolutionInfo"
      ).and.rejectWith(
        new Error("Item " + testItem + " is not a deployed Solution")
      );

      deleteSolution
        .deleteSolution(testItem, MOCK_USER_SESSION)
        .then((response: interfaces.ISolutionPrecis[]) => {
          expect(response).toEqual([undefined, undefined]);
          done();
        });
    });

    it("deletes a Solution", done => {
      const getDeletableSolutionInfoSpy = spyOn(
        getDeletableSolutionInfo,
        "getDeletableSolutionInfo"
      ).and.resolveTo(
        mockItems.getSolutionPrecis([
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Web Mapping Application")
        ])
      );
      const _removeItemsSpy = spyOn(removeItems, "removeItems").and.resolveTo([
        mockItems.getSolutionPrecis([
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Web Mapping Application")
        ]),
        mockItems.getSolutionPrecis()
      ]);
      const _removeItemSpy = spyOn(restHelpers, "removeItem").and.resolveTo({
        success: true,
        itemId: "sol1234567890"
      });
      const _reportProgressSpy = spyOn(reportProgress, "reportProgress");
      const _deleteSolutionFolderSpy = spyOn(
        deleteSolutionFolder,
        "deleteSolutionFolder"
      ).and.resolveTo(true);

      deleteSolution
        .deleteSolution("sol1234567890", MOCK_USER_SESSION)
        .then((response: interfaces.ISolutionPrecis[]) => {
          expect(response).toEqual([
            mockItems.getSolutionPrecis([
              mockItems.getAGOLItemPrecis("Web Map"),
              mockItems.getAGOLItemPrecis("Web Mapping Application")
            ]),
            mockItems.getSolutionPrecis()
          ]);
          done();
        });
    });

    it("deletes a Solution that doesn't contain deletable items", done => {
      const getDeletableSolutionInfoSpy = spyOn(
        getDeletableSolutionInfo,
        "getDeletableSolutionInfo"
      ).and.resolveTo(mockItems.getSolutionPrecis());
      const _removeItemSpy = spyOn(restHelpers, "removeItem").and.resolveTo({
        success: true,
        itemId: "sol1234567890"
      });
      const _reportProgressSpy = spyOn(reportProgress, "reportProgress");
      const _deleteSolutionFolderSpy = spyOn(
        deleteSolutionFolder,
        "deleteSolutionFolder"
      ).and.resolveTo(true);

      deleteSolution
        .deleteSolution("sol1234567890", MOCK_USER_SESSION)
        .then((response: interfaces.ISolutionPrecis[]) => {
          expect(response).toEqual([
            mockItems.getSolutionPrecis(),
            mockItems.getSolutionPrecis()
          ]);
          done();
        });
    });

    it("deletes a Solution containing a Hub Site Application", done => {
      const getDeletableSolutionInfoSpy = spyOn(
        getDeletableSolutionInfo,
        "getDeletableSolutionInfo"
      ).and.resolveTo(
        mockItems.getSolutionPrecis([
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Hub Site Application")
        ])
      );
      const _removeItemsSpy = spyOn(removeItems, "removeItems").and.resolveTo([
        mockItems.getSolutionPrecis([
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Hub Site Application")
        ]),
        mockItems.getSolutionPrecis()
      ]);
      const _removeItemSpy = spyOn(restHelpers, "removeItem").and.resolveTo({
        success: true,
        itemId: "sol1234567890"
      });
      const createHubRequestOptionsSpy = spyOn(
        createHRO,
        "createHubRequestOptions"
      ).and.resolveTo(
        utils.getSuccessResponse({
          authentication: MOCK_USER_SESSION,
          hubApiUrl: "https://hub.arcgis.com",
          isPortal: false
        })
      );
      const _reportProgressSpy = spyOn(reportProgress, "reportProgress");
      const _deleteSolutionFolderSpy = spyOn(
        deleteSolutionFolder,
        "deleteSolutionFolder"
      ).and.resolveTo(true);

      deleteSolution
        .deleteSolution("sol1234567890", MOCK_USER_SESSION)
        .then((response: interfaces.ISolutionPrecis[]) => {
          expect(response).toEqual([
            mockItems.getSolutionPrecis([
              mockItems.getAGOLItemPrecis("Web Map"),
              mockItems.getAGOLItemPrecis("Hub Site Application")
            ]),
            mockItems.getSolutionPrecis()
          ]);
          done();
        });
    });

    it("doesn't delete all of the items of a Solution", done => {
      const getDeletableSolutionInfoSpy = spyOn(
        getDeletableSolutionInfo,
        "getDeletableSolutionInfo"
      ).and.resolveTo(
        mockItems.getSolutionPrecis([
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Web Mapping Application")
        ])
      );
      const _removeItemsSpy = spyOn(removeItems, "removeItems").and.resolveTo([
        mockItems.getSolutionPrecis([
          mockItems.getAGOLItemPrecis("Web Mapping Application")
        ]),
        mockItems.getSolutionPrecis([mockItems.getAGOLItemPrecis("Web Map")])
      ]);
      const _removeItemSpy = spyOn(restHelpers, "removeItem").and.resolveTo({
        success: true,
        itemId: "sol1234567890"
      });
      const _reportProgressSpy = spyOn(reportProgress, "reportProgress");
      const _deleteSolutionFolderSpy = spyOn(
        deleteSolutionFolder,
        "deleteSolutionFolder"
      ).and.resolveTo(true);

      deleteSolution
        .deleteSolution("sol1234567890", MOCK_USER_SESSION)
        .then((response: interfaces.ISolutionPrecis[]) => {
          expect(response).toEqual([
            mockItems.getSolutionPrecis([
              mockItems.getAGOLItemPrecis("Web Mapping Application")
            ]),
            mockItems.getSolutionPrecis([
              mockItems.getAGOLItemPrecis("Web Map")
            ])
          ]);
          done();
        });
    });

    it("deletes the items of a Solution, but deleting the Solution itself fails", done => {
      const getDeletableSolutionInfoSpy = spyOn(
        getDeletableSolutionInfo,
        "getDeletableSolutionInfo"
      ).and.resolveTo(
        mockItems.getSolutionPrecis([
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Web Mapping Application")
        ])
      );
      const _removeItemsSpy = spyOn(removeItems, "removeItems").and.resolveTo([
        mockItems.getSolutionPrecis([
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Web Mapping Application")
        ]),
        mockItems.getSolutionPrecis()
      ]);
      const _removeItemSpy = spyOn(restHelpers, "removeItem").and.resolveTo({
        success: false,
        itemId: "sol1234567890"
      });
      const _reportProgressSpy = spyOn(reportProgress, "reportProgress");

      deleteSolution
        .deleteSolution("sol1234567890", MOCK_USER_SESSION)
        .then((response: interfaces.ISolutionPrecis[]) => {
          expect(response).toEqual([
            mockItems.getSolutionPrecis([
              mockItems.getAGOLItemPrecis("Web Map"),
              mockItems.getAGOLItemPrecis("Web Mapping Application")
            ]),
            mockItems.getSolutionPrecis()
          ]);
          done();
        });
    });

    it("deletes a Solution, but deleting its folder fails", done => {
      const getDeletableSolutionInfoSpy = spyOn(
        getDeletableSolutionInfo,
        "getDeletableSolutionInfo"
      ).and.resolveTo(
        mockItems.getSolutionPrecis([
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Web Mapping Application")
        ])
      );
      const _removeItemsSpy = spyOn(removeItems, "removeItems").and.resolveTo([
        mockItems.getSolutionPrecis([
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Web Mapping Application")
        ]),
        mockItems.getSolutionPrecis()
      ]);
      const _removeItemSpy = spyOn(restHelpers, "removeItem").and.resolveTo({
        success: true,
        itemId: "sol1234567890"
      });
      const _reportProgressSpy = spyOn(reportProgress, "reportProgress");
      const _deleteSolutionFolderSpy = spyOn(
        deleteSolutionFolder,
        "deleteSolutionFolder"
      ).and.resolveTo(false);

      deleteSolution
        .deleteSolution("sol1234567890", MOCK_USER_SESSION)
        .then((response: interfaces.ISolutionPrecis[]) => {
          expect(response).toEqual([
            mockItems.getSolutionPrecis([
              mockItems.getAGOLItemPrecis("Web Map"),
              mockItems.getAGOLItemPrecis("Web Mapping Application")
            ]),
            mockItems.getSolutionPrecis()
          ]);
          done();
        });
    });
  });

  describe("getDeletableSolutionInfo", () => {
    it("passes through each item related to one solution", done => {
      const solutionSummary = mockItems.getSolutionPrecis([
        mockItems.getAGOLItemPrecis("Web Map"),
        mockItems.getAGOLItemPrecis("Web Mapping Application")
      ]);

      const getSolutionSummarySpy = spyOn(
        getSolutionSummary,
        "getSolutionSummary"
      ).and.resolveTo(solutionSummary);
      const getSolutionsRelatedToAnItemSpy = spyOn(
        restHelpersGet,
        "getSolutionsRelatedToAnItem"
      ).and.resolveTo(["sol1234567890"]);

      getDeletableSolutionInfo
        .getDeletableSolutionInfo("sol1234567890", MOCK_USER_SESSION)
        .then((result: interfaces.ISolutionPrecis) => {
          expect(result).toEqual(solutionSummary);
          done();
        }, done.fail);
    });

    it("it filters out an item that is related to more than one solution", done => {
      const solutionSummary = mockItems.getSolutionPrecis([
        mockItems.getAGOLItemPrecis("Web Map"),
        mockItems.getAGOLItemPrecis("Web Mapping Application")
      ]);

      const getSolutionSummarySpy = spyOn(
        getSolutionSummary,
        "getSolutionSummary"
      ).and.resolveTo(solutionSummary);
      const getSolutionsRelatedToAnItemSpy = spyOn(
        restHelpersGet,
        "getSolutionsRelatedToAnItem"
      ).and.returnValues(
        Promise.resolve(["sol1234567890"]),
        Promise.resolve(["sol1234567890", "sol1234567891"])
      );

      getDeletableSolutionInfo
        .getDeletableSolutionInfo("sol1234567890", MOCK_USER_SESSION)
        .then(result => {
          const expectedSolutionSummary = mockItems.getSolutionPrecis([
            mockItems.getAGOLItemPrecis("Web Map")
          ]);
          expect(result).toEqual(expectedSolutionSummary);
          done();
        }, done.fail);
    });
  });

  describe("getSolutionSummary", () => {
    it("rejects a non-Solution item", done => {
      const getItemBaseSpy = spyOn(restHelpersGet, "getItemBase").and.resolveTo(
        mockItems.getAGOLItem("Web Map")
      );
      const getItemDataAsJsonSpy = spyOn(
        restHelpersGet,
        "getItemDataAsJson"
      ).and.resolveTo({});

      getSolutionSummary
        .getSolutionSummary("sol1234567890", MOCK_USER_SESSION)
        .then(
          () => {
            done.fail();
          },
          () => {
            done();
          }
        );
    });

    it("rejects a Solution template", done => {
      const solutionItem = mockItems.getCompleteDeployedSolutionItemVersioned();
      solutionItem.base.typeKeywords = solutionItem.base.typeKeywords.filter(
        (keyword: string) => keyword != "Deployed"
      );
      solutionItem.base.typeKeywords.push("Template");

      const getItemBaseSpy = spyOn(restHelpersGet, "getItemBase").and.resolveTo(
        solutionItem.base
      );
      const getItemDataAsJsonSpy = spyOn(
        restHelpersGet,
        "getItemDataAsJson"
      ).and.resolveTo(solutionItem.data);

      getSolutionSummary
        .getSolutionSummary("sol1234567890", MOCK_USER_SESSION)
        .then(
          () => {
            done.fail();
          },
          () => {
            done();
          }
        );
    });

    it("handles case with no forward relationships from solution", done => {
      const solutionItem = mockItems.getCompleteDeployedSolutionItemVersioned();
      const getItemBaseSpy = spyOn(restHelpersGet, "getItemBase").and.resolveTo(
        solutionItem.base
      );
      const getItemDataAsJsonSpy = spyOn(
        restHelpersGet,
        "getItemDataAsJson"
      ).and.resolveTo(solutionItem.data);
      const getItemsRelatedToASolutionSpy = spyOn(
        restHelpersGet,
        "getItemsRelatedToASolution"
      ).and.resolveTo([]);

      getSolutionSummary
        .getSolutionSummary(solutionItem.base.id, MOCK_USER_SESSION)
        .then(result => {
          expect(result).toEqual(mockItems.getSolutionPrecis());
          done();
        }, done.fail);
    });

    it("gets a version 0 Solution summary", done => {
      const solutionItem = mockItems.getCompleteDeployedSolutionItemVersioned(
        0
      );
      const getItemBaseSpy = spyOn(restHelpersGet, "getItemBase").and.resolveTo(
        solutionItem.base
      );
      const getItemDataAsJsonSpy = spyOn(
        restHelpersGet,
        "getItemDataAsJson"
      ).and.resolveTo(solutionItem.data);
      const getItemsRelatedToASolutionSpy = spyOn(
        restHelpersGet,
        "getItemsRelatedToASolution"
      ).and.resolveTo([
        mockItems.getAGOLItem("Web Map"),
        mockItems.getAGOLItem("Web Mapping Application")
      ]);
      const _reconstructBuildOrderIdsSpy = spyOn(
        reconstructBuildOrderIds,
        "reconstructBuildOrderIds"
      ).and.callThrough();

      getSolutionSummary
        .getSolutionSummary(solutionItem.base.id, MOCK_USER_SESSION)
        .then(result => {
          expect(result).toEqual(
            mockItems.getSolutionPrecis([
              mockItems.getAGOLItemPrecis("Web Map"),
              mockItems.getAGOLItemPrecis("Web Mapping Application")
            ])
          );
          expect(_reconstructBuildOrderIdsSpy.calls.count()).toEqual(1);
          done();
        }, done.fail);
    });

    it("gets a version 1 Solution summary", done => {
      const solutionItem = mockItems.getCompleteDeployedSolutionItemVersioned(
        1
      );
      const getItemBaseSpy = spyOn(restHelpersGet, "getItemBase").and.resolveTo(
        solutionItem.base
      );
      const getItemDataAsJsonSpy = spyOn(
        restHelpersGet,
        "getItemDataAsJson"
      ).and.resolveTo(solutionItem.data);
      const getItemsRelatedToASolutionSpy = spyOn(
        restHelpersGet,
        "getItemsRelatedToASolution"
      ).and.resolveTo([
        mockItems.getAGOLItem("Web Map"),
        mockItems.getAGOLItem("Web Mapping Application")
      ]);
      const _reconstructBuildOrderIdsSpy = spyOn(
        reconstructBuildOrderIds,
        "reconstructBuildOrderIds"
      ).and.callThrough();

      getSolutionSummary
        .getSolutionSummary(solutionItem.base.id, MOCK_USER_SESSION)
        .then(result => {
          expect(result).toEqual(
            mockItems.getSolutionPrecis([
              mockItems.getAGOLItemPrecis("Web Map"),
              mockItems.getAGOLItemPrecis("Web Mapping Application")
            ])
          );
          expect(_reconstructBuildOrderIdsSpy.calls.count()).toEqual(0);
          done();
        }, done.fail);
    });
  });

  describe("deleteSolutionFolder", () => {
    it("empty folder", done => {
      const getUserSpy = spyOn(MOCK_USER_SESSION, "getUser").and.resolveTo({
        orgId: "orgABC"
      });
      const searchSpy = spyOn(portal, "searchItems").and.resolveTo({
        total: 0,
        results: []
      } as any);
      const removeFolderSpy = spyOn(portal, "removeFolder").and.resolveTo({
        success: true
      } as any);

      deleteSolutionFolder
        .deleteSolutionFolder([], "fld1234567890", MOCK_USER_SESSION)
        .then(result => {
          expect(result).toBeTruthy();
          expect(removeFolderSpy.calls.count()).toEqual(1);
          done();
        }, done.fail);
    });

    it("deletes a folder with only solution items remaining", done => {
      const getUserSpy = spyOn(MOCK_USER_SESSION, "getUser").and.resolveTo({
        orgId: "orgABC"
      });
      const searchSpy = spyOn(portal, "searchItems").and.resolveTo({
        total: 1,
        results: [
          {
            id: "map1234567890"
          }
        ]
      } as any);
      const removeFolderSpy = spyOn(portal, "removeFolder").and.resolveTo({
        success: true
      } as any);

      deleteSolutionFolder
        .deleteSolutionFolder(
          ["map1234567890"],
          "fld1234567890",
          MOCK_USER_SESSION
        )
        .then(result => {
          expect(result).toBeTruthy();
          expect(removeFolderSpy.calls.count()).toEqual(1);
          done();
        }, done.fail);
    });

    it("does not delete a folder with non-solution items remaining", done => {
      const getUserSpy = spyOn(MOCK_USER_SESSION, "getUser").and.resolveTo({
        orgId: "orgABC"
      });
      const searchSpy = spyOn(portal, "searchItems").and.resolveTo({
        total: 2,
        results: [
          {
            id: "map1234567890"
          },
          {
            id: "svc1234567890"
          }
        ]
      } as any);
      const removeFolderSpy = spyOn(portal, "removeFolder").and.resolveTo({
        success: true
      } as any);

      deleteSolutionFolder
        .deleteSolutionFolder(
          ["map1234567890"],
          "fld1234567890",
          MOCK_USER_SESSION
        )
        .then(result => {
          expect(result).toBeTruthy();
          expect(removeFolderSpy.calls.count()).toEqual(0);
          done();
        }, done.fail);
    });

    it("fails to delete folder", done => {
      const getUserSpy = spyOn(MOCK_USER_SESSION, "getUser").and.resolveTo({
        orgId: "orgABC"
      });
      const searchSpy = spyOn(portal, "searchItems").and.resolveTo({
        total: 1,
        results: [
          {
            id: "map1234567890"
          }
        ]
      } as any);
      const removeFolderSpy = spyOn(portal, "removeFolder").and.resolveTo({
        success: false
      } as any);

      deleteSolutionFolder
        .deleteSolutionFolder(
          ["map1234567890"],
          "fld1234567890",
          MOCK_USER_SESSION
        )
        .then(result => {
          expect(result).toBeFalsy();
          expect(removeFolderSpy.calls.count()).toEqual(1);
          done();
        }, done.fail);
    });
  });

  describe("reconstructBuildOrderIds", () => {
    it("handles an empty list", () => {
      const templates: interfaces.IItemTemplate[] = [];
      const buildOrderIds = reconstructBuildOrderIds.reconstructBuildOrderIds(
        templates
      );
      expect(buildOrderIds).toEqual([]);
    });
  });

  describe("removeItems", () => {
    it("handles an empty list of item ids with all items so far successful", done => {
      const solutionSummary: interfaces.ISolutionPrecis = mockItems.getSolutionPrecis();
      const hubSiteItemIds: string[] = [];
      const percentDone: number = 50.4;
      const progressPercentStep: number = 10.4;

      removeItems
        .removeItems(
          solutionSummary,
          hubSiteItemIds,
          MOCK_USER_SESSION,
          percentDone,
          progressPercentStep
        )
        .then((results: interfaces.ISolutionPrecis[]) => {
          const [solutionDeletedSummary, solutionFailureSummary] = results;
          expect(solutionDeletedSummary.items.length).toEqual(0);
          expect(solutionFailureSummary.items.length).toEqual(0);
          done();
        }, done.fail);
    });

    it("deletes a list of item ids", done => {
      const firstItemId = "map1234567890";
      const secondItemId = "svc1234567890";
      const solutionSummary: interfaces.ISolutionPrecis = mockItems.getSolutionPrecis(
        [
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Feature Service")
        ]
      );
      const hubSiteItemIds: string[] = [];
      const percentDone: number = 50.4;
      const progressPercentStep: number = 10.4;

      const unprotectItemSpy = spyOn(portal, "unprotectItem").and.resolveTo(
        utils.getSuccessResponse()
      );

      const removeItemSpy = spyOn(restHelpers, "removeItem").and.returnValues(
        Promise.resolve(utils.getSuccessResponse({ id: firstItemId })),
        Promise.resolve(utils.getSuccessResponse({ id: secondItemId }))
      );

      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      utils.setMockDateTime(now);
      const consoleSpy = spyOn(console, "log");

      removeItems
        .removeItems(
          solutionSummary,
          hubSiteItemIds,
          MOCK_USER_SESSION,
          percentDone,
          progressPercentStep,
          { consoleProgress: true }
        )
        .then(
          (results: interfaces.ISolutionPrecis[]) => {
            const [solutionDeletedSummary, solutionFailureSummary] = results;
            expect(solutionDeletedSummary.items.length).toEqual(2);
            expect(solutionFailureSummary.items.length).toEqual(0);

            expect(removeItemSpy.calls.count()).toBe(
              2,
              "should call removeItem twice"
            );
            expect(removeItemSpy.calls.argsFor(0)[0]).toEqual(secondItemId);
            expect(removeItemSpy.calls.argsFor(0)[1]).toEqual(
              MOCK_USER_SESSION
            );
            expect(removeItemSpy.calls.argsFor(1)[0]).toEqual(firstItemId);
            expect(removeItemSpy.calls.argsFor(1)[1]).toEqual(
              MOCK_USER_SESSION
            );

            expect(consoleSpy.calls.count()).toBe(
              2,
              "should call console.log twice"
            );
            expect(consoleSpy.calls.argsFor(0)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(0)[1]).toBe(secondItemId);
            expect(consoleSpy.calls.argsFor(0)[2]).toBe("");
            expect(consoleSpy.calls.argsFor(0)[3]).toBe("3 Finished");
            expect(consoleSpy.calls.argsFor(0)[4]).toBe(
              Math.round(percentDone + progressPercentStep) + "%"
            );
            expect(consoleSpy.calls.argsFor(1)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(1)[1]).toBe(firstItemId);
            expect(consoleSpy.calls.argsFor(1)[2]).toBe("");
            expect(consoleSpy.calls.argsFor(1)[3]).toBe("3 Finished");
            expect(consoleSpy.calls.argsFor(1)[4]).toBe(
              Math.round(percentDone + 2 * progressPercentStep) + "%"
            );

            jasmine.clock().uninstall();
            done();
          },
          () => {
            jasmine.clock().uninstall();
            done.fail();
          }
        );
    });

    it("deletes a list of item ids, with the first one failing", done => {
      const firstItemId = "map1234567890";
      const secondItemId = "svc1234567890";
      const solutionSummary: interfaces.ISolutionPrecis = mockItems.getSolutionPrecis(
        [
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Feature Service")
        ]
      );
      const hubSiteItemIds: string[] = [];
      const percentDone: number = 50.4;
      const progressPercentStep: number = 10.4;

      const unprotectItemSpy = spyOn(portal, "unprotectItem").and.resolveTo(
        utils.getSuccessResponse()
      );

      const removeItemSpy = spyOn(restHelpers, "removeItem").and.returnValues(
        Promise.resolve(utils.getSuccessResponse({ id: secondItemId })),
        Promise.reject(utils.getFailureResponse({ id: firstItemId }))
      );

      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      utils.setMockDateTime(now);
      const consoleSpy = spyOn(console, "log");

      removeItems
        .removeItems(
          solutionSummary,
          hubSiteItemIds,
          MOCK_USER_SESSION,
          percentDone,
          progressPercentStep,
          { consoleProgress: true }
        )
        .then(
          (results: interfaces.ISolutionPrecis[]) => {
            const [solutionDeletedSummary, solutionFailureSummary] = results;

            expect(unprotectItemSpy.calls.count()).toBe(
              2,
              "should call unprotectItemSpy twice"
            );
            expect(unprotectItemSpy.calls.argsFor(0)[0]).toEqual({
              id: secondItemId,
              authentication: MOCK_USER_SESSION
            });
            expect(unprotectItemSpy.calls.argsFor(1)[0]).toEqual({
              id: firstItemId,
              authentication: MOCK_USER_SESSION
            });

            expect(removeItemSpy.calls.count()).toBe(
              2,
              "should call removeItem twice"
            );
            expect(removeItemSpy.calls.argsFor(0)[0]).toEqual(secondItemId);
            expect(removeItemSpy.calls.argsFor(0)[1]).toEqual(
              MOCK_USER_SESSION
            );
            expect(removeItemSpy.calls.argsFor(1)[0]).toEqual(firstItemId);
            expect(removeItemSpy.calls.argsFor(1)[1]).toEqual(
              MOCK_USER_SESSION
            );

            expect(consoleSpy.calls.count()).toBe(
              2,
              "should call console.log twice"
            );

            expect(consoleSpy.calls.argsFor(0)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(0)[1]).toBe(secondItemId);
            expect(consoleSpy.calls.argsFor(0)[2]).toBe("");
            expect(consoleSpy.calls.argsFor(0)[3]).toBe("3 Finished");
            expect(consoleSpy.calls.argsFor(0)[4]).toBe(
              Math.round(percentDone + progressPercentStep) + "%"
            );
            expect(solutionDeletedSummary.items.length).toEqual(1);
            expect(solutionDeletedSummary.items[0].id).toEqual(secondItemId);

            expect(consoleSpy.calls.argsFor(1)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(1)[1]).toBe(firstItemId);
            expect(consoleSpy.calls.argsFor(1)[2]).toBe("");
            expect(consoleSpy.calls.argsFor(1)[3]).toBe("3 Failed");
            expect(consoleSpy.calls.argsFor(1)[4]).toBe(
              Math.round(percentDone + 2 * progressPercentStep) + "%"
            );
            expect(solutionFailureSummary.items.length).toEqual(1);
            expect(solutionFailureSummary.items[0].id).toEqual(firstItemId);

            jasmine.clock().uninstall();
            done();
          },
          () => {
            jasmine.clock().uninstall();
            done.fail();
          }
        );
    });

    it("deletes a list of item ids, skipping a missing one", done => {
      const firstItemId = "map1234567890";
      const secondItemId = "svc1234567890";
      const solutionSummary: interfaces.ISolutionPrecis = mockItems.getSolutionPrecis(
        [
          mockItems.getAGOLItemPrecis("Web Map"),
          mockItems.getAGOLItemPrecis("Feature Service")
        ]
      );
      const hubSiteItemIds: string[] = [];
      const percentDone: number = 50.4;
      const progressPercentStep: number = 10.4;

      const unprotectItemSpy = spyOn(portal, "unprotectItem").and.returnValues(
        Promise.resolve(utils.getSuccessResponse({ id: secondItemId })),
        Promise.reject(mockItems.get400Failure())
      );

      const removeItemSpy = spyOn(restHelpers, "removeItem").and.resolveTo(
        utils.getSuccessResponse({ id: secondItemId })
      );

      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      utils.setMockDateTime(now);
      const consoleSpy = spyOn(console, "log");

      removeItems
        .removeItems(
          solutionSummary,
          hubSiteItemIds,
          MOCK_USER_SESSION,
          percentDone,
          progressPercentStep,
          { consoleProgress: true }
        )
        .then(
          (results: interfaces.ISolutionPrecis[]) => {
            const [solutionDeletedSummary, solutionFailureSummary] = results;
            expect(solutionDeletedSummary.items.length).toEqual(1);
            expect(solutionFailureSummary.items.length).toEqual(0);

            expect(unprotectItemSpy.calls.count()).toBe(
              2,
              "should call unprotectItemSpy twice"
            );
            expect(unprotectItemSpy.calls.argsFor(0)[0]).toEqual({
              id: secondItemId,
              authentication: MOCK_USER_SESSION
            });
            expect(unprotectItemSpy.calls.argsFor(1)[0]).toEqual({
              id: firstItemId,
              authentication: MOCK_USER_SESSION
            });

            expect(removeItemSpy.calls.count()).toBe(
              1,
              "should call removeItem once"
            );
            expect(removeItemSpy.calls.argsFor(0)[0]).toEqual(secondItemId);
            expect(removeItemSpy.calls.argsFor(0)[1]).toEqual(
              MOCK_USER_SESSION
            );

            expect(consoleSpy.calls.count()).toBe(
              2,
              "should call console.log twice"
            );
            expect(consoleSpy.calls.argsFor(0)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(0)[1]).toBe(secondItemId);
            expect(consoleSpy.calls.argsFor(0)[2]).toBe("");
            expect(consoleSpy.calls.argsFor(0)[3]).toBe("3 Finished");
            expect(consoleSpy.calls.argsFor(0)[4]).toBe(
              Math.round(percentDone + progressPercentStep) + "%"
            );
            expect(consoleSpy.calls.argsFor(1)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(1)[1]).toBe(firstItemId);
            expect(consoleSpy.calls.argsFor(1)[2]).toBe("");
            expect(consoleSpy.calls.argsFor(1)[3]).toBe("3 Ignored");
            expect(consoleSpy.calls.argsFor(1)[4]).toBe(
              Math.round(percentDone + 2 * progressPercentStep) + "%"
            );

            jasmine.clock().uninstall();
            done();
          },
          () => {
            jasmine.clock().uninstall();
            done.fail();
          }
        );
    });

    it("deletes hub site applications via hub.js", done => {
      const itemId = "hsa1234567890";
      const solutionSummary: interfaces.ISolutionPrecis = mockItems.getSolutionPrecis(
        [mockItems.getAGOLItemPrecis("Hub Site Application")]
      );
      const hubSiteItemIds: string[] = [itemId];
      const percentDone: number = 50.4;
      const progressPercentStep: number = 10.4;

      const unprotectItemSpy = spyOn(portal, "unprotectItem").and.resolveTo(
        utils.getSuccessResponse()
      );

      const createHubRequestOptionsSpy = spyOn(
        createHRO,
        "createHubRequestOptions"
      ).and.resolveTo(
        utils.getSuccessResponse({
          authentication: MOCK_USER_SESSION,
          hubApiUrl: "https://hub.arcgis.com",
          isPortal: false
        })
      );

      const removeItemSpy = spyOn(hubSites, "removeSite").and.returnValues(
        Promise.resolve(utils.getSuccessResponse({ id: itemId }))
      );

      removeItems
        .removeItems(
          solutionSummary,
          hubSiteItemIds,
          MOCK_USER_SESSION,
          percentDone,
          progressPercentStep
        )
        .then(
          (results: interfaces.ISolutionPrecis[]) => {
            const [solutionDeletedSummary, solutionFailureSummary] = results;
            expect(solutionDeletedSummary.items.length).toEqual(1);
            expect(solutionFailureSummary.items.length).toEqual(0);

            expect(removeItemSpy.calls.count()).toBe(
              1,
              "should call removeItem once"
            );
            expect(removeItemSpy.calls.argsFor(0)[0]).toEqual(itemId);
            expect(removeItemSpy.calls.argsFor(0)[1].authentication).toEqual(
              MOCK_USER_SESSION
            );
            expect(removeItemSpy.calls.argsFor(0)[1].hubApiUrl).toEqual(
              "https://hub.arcgis.com"
            );
            expect(removeItemSpy.calls.argsFor(0)[1].isPortal).toBeFalsy();
            done();
          },
          () => {
            done.fail();
          }
        );
    });
  });

  describe("reportProgress", () => {
    it("uses progressCallback with just defaults", () => {
      const percentDone: number = 50.4;
      const deleteOptions: interfaces.IDeleteSolutionOptions = {
        progressCallback: (iPercentDone, jobId, data) => {
          expect(iPercentDone).toEqual(Math.round(percentDone));
          expect(jobId).toBeUndefined();
          expect(data.event).toEqual("");
          expect(data.data).toEqual("");
        }
      };

      reportProgress.reportProgress(percentDone, deleteOptions);
    });

    it("uses progressCallback with item id, job id, and status", () => {
      const deletedItemId = "sln1234567890";
      const percentDone: number = 50.4;
      const status = interfaces.EItemProgressStatus.Finished;
      const deleteOptions: interfaces.IDeleteSolutionOptions = {
        jobId: "Ginger",
        progressCallback: (iPercentDone, jobId, data) => {
          expect(iPercentDone).toEqual(Math.round(percentDone));
          expect(jobId).toEqual(deleteOptions.jobId);
          expect(data.event).toEqual("");
          expect(data.data).toEqual(deletedItemId);
        }
      };

      reportProgress.reportProgress(
        percentDone,
        deleteOptions,
        deletedItemId,
        status
      );
    });

    it("uses consoleProgress with just defaults", () => {
      const percentDone: number = 50.4;
      const deleteOptions: interfaces.IDeleteSolutionOptions = {
        consoleProgress: true
      };

      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      utils.setMockDateTime(now);
      const consoleSpy = spyOn(console, "log");

      reportProgress.reportProgress(percentDone, deleteOptions);

      expect(consoleSpy.calls.count()).toBe(1, "should call console.log once");
      expect(consoleSpy.calls.argsFor(0)[0]).toBe(now);
      expect(consoleSpy.calls.argsFor(0)[1]).toBe("");
      expect(consoleSpy.calls.argsFor(0)[2]).toBe("");
      expect(consoleSpy.calls.argsFor(0)[3]).toBe("1 Started");
      expect(consoleSpy.calls.argsFor(0)[4]).toBe("50%");

      jasmine.clock().uninstall();
    });

    it("uses consoleProgress with item id, job id, and status", () => {
      const deletedItemId = "sln1234567890";
      const percentDone: number = 50.4;
      const status = interfaces.EItemProgressStatus.Finished;
      const deleteOptions: interfaces.IDeleteSolutionOptions = {
        jobId: "Ginger",
        consoleProgress: true
      };

      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      utils.setMockDateTime(now);
      const consoleSpy = spyOn(console, "log");

      reportProgress.reportProgress(
        percentDone,
        deleteOptions,
        deletedItemId,
        status
      );

      expect(consoleSpy.calls.count()).toBe(1, "should call console.log once");
      expect(consoleSpy.calls.argsFor(0)[0]).toBe(now);
      expect(consoleSpy.calls.argsFor(0)[1]).toBe(deletedItemId);
      expect(consoleSpy.calls.argsFor(0)[2]).toBe("Ginger");
      expect(consoleSpy.calls.argsFor(0)[3]).toBe("3 Finished");
      expect(consoleSpy.calls.argsFor(0)[4]).toBe("50%");

      jasmine.clock().uninstall();
    });
  });
});

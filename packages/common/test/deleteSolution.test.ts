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

import * as deleteSolution from "../src/deleteSolution";
import * as interfaces from "../src/interfaces";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as portal from "@esri/arcgis-rest-portal";
import * as restHelpers from "../src/restHelpers";
import * as restHelpersGet from "../src/restHelpersGet";
import * as utils from "./mocks/utils";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `deleteSolution`: functions for deleting a deployed Solution item and all of its items", () => {
  describe("deleteSolution", () => {
    it("rejects a Solution template", done => {
      const solutionItem = mockItems.getCompleteDeployedSolutionItemVersioned(
        "0"
      );
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

      deleteSolution
        .deleteSolution(solutionItem.base.id, MOCK_USER_SESSION)
        .then(
          () => done.fail(),
          failed => {
            expect(failed).toEqual(
              "Item " + solutionItem.base.id + " is not a deployed Solution"
            );
            done();
          }
        );
    });

    it("deletes a version 0 Solution", done => {
      const solutionItem = mockItems.getCompleteDeployedSolutionItemVersioned(
        "0"
      );

      const getItemBaseSpy = spyOn(restHelpersGet, "getItemBase").and.resolveTo(
        solutionItem.base
      );
      const getItemDataAsJsonSpy = spyOn(
        restHelpersGet,
        "getItemDataAsJson"
      ).and.resolveTo(solutionItem.data);

      const unprotectItemSpy = spyOn(portal, "unprotectItem").and.resolveTo(
        utils.getSuccessResponse()
      );

      const removeItemSpy = spyOn(restHelpers, "removeItem").and.returnValues(
        Promise.resolve(
          utils.getSuccessResponse({
            id: solutionItem.data.templates[0].itemId
          })
        ),
        Promise.resolve(
          utils.getSuccessResponse({
            id: solutionItem.data.templates[1].itemId
          })
        ),
        Promise.resolve(utils.getSuccessResponse({ id: solutionItem.base.id }))
      );

      deleteSolution
        .deleteSolution(solutionItem.base.id, MOCK_USER_SESSION)
        .then(ok => {
          expect(ok).toBeTruthy();
          done();
        }, done.fail);
    });

    it("deletes a version 1 Solution", done => {
      const solutionItem = mockItems.getCompleteDeployedSolutionItemVersioned(
        "1"
      );

      const getItemBaseSpy = spyOn(restHelpersGet, "getItemBase").and.resolveTo(
        solutionItem.base
      );
      const getItemDataAsJsonSpy = spyOn(
        restHelpersGet,
        "getItemDataAsJson"
      ).and.resolveTo(solutionItem.data);

      const unprotectItemSpy = spyOn(portal, "unprotectItem").and.resolveTo(
        utils.getSuccessResponse()
      );

      const removeItemSpy = spyOn(restHelpers, "removeItem").and.returnValues(
        Promise.resolve(
          utils.getSuccessResponse({
            id: solutionItem.data.templates[0].itemId
          })
        ),
        Promise.resolve(
          utils.getSuccessResponse({
            id: solutionItem.data.templates[1].itemId
          })
        ),
        Promise.resolve(utils.getSuccessResponse({ id: solutionItem.base.id }))
      );

      deleteSolution
        .deleteSolution(solutionItem.base.id, MOCK_USER_SESSION)
        .then(ok => {
          expect(ok).toBeTruthy();
          done();
        }, done.fail);
    });

    it("deletes a version 1 Solution, but one of the items fails", done => {
      const solutionItem = mockItems.getCompleteDeployedSolutionItemVersioned(
        "1"
      );

      const getItemBaseSpy = spyOn(restHelpersGet, "getItemBase").and.resolveTo(
        solutionItem.base
      );
      const getItemDataAsJsonSpy = spyOn(
        restHelpersGet,
        "getItemDataAsJson"
      ).and.resolveTo(solutionItem.data);

      const unprotectItemSpy = spyOn(portal, "unprotectItem").and.resolveTo(
        utils.getSuccessResponse()
      );

      const removeItemSpy = spyOn(restHelpers, "removeItem").and.returnValues(
        Promise.resolve(
          utils.getSuccessResponse({
            id: solutionItem.data.templates[0].itemId
          })
        ),
        Promise.resolve(
          utils.getFailureResponse({
            id: solutionItem.data.templates[1].itemId
          })
        )
      );

      deleteSolution
        .deleteSolution(solutionItem.base.id, MOCK_USER_SESSION)
        .then(ok => {
          expect(ok).toBeFalsy();
          done();
        }, done.fail);
    });

    it("deletes a version 1 Solution, but deleting the Solution item fails", done => {
      const solutionItem = mockItems.getCompleteDeployedSolutionItemVersioned(
        "1"
      );

      const getItemBaseSpy = spyOn(restHelpersGet, "getItemBase").and.resolveTo(
        solutionItem.base
      );
      const getItemDataAsJsonSpy = spyOn(
        restHelpersGet,
        "getItemDataAsJson"
      ).and.resolveTo(solutionItem.data);

      const unprotectItemSpy = spyOn(portal, "unprotectItem").and.resolveTo(
        utils.getSuccessResponse()
      );

      const removeItemSpy = spyOn(restHelpers, "removeItem").and.returnValues(
        Promise.resolve(
          utils.getSuccessResponse({
            id: solutionItem.data.templates[0].itemId
          })
        ),
        Promise.resolve(
          utils.getSuccessResponse({
            id: solutionItem.data.templates[1].itemId
          })
        ),
        Promise.resolve(utils.getFailureResponse({ id: solutionItem.base.id }))
      );

      deleteSolution
        .deleteSolution(solutionItem.base.id, MOCK_USER_SESSION)
        .then(ok => {
          expect(ok).toBeFalsy();
          done();
        }, done.fail);
    });
  });

  describe("_reconstructBuildOrderIds", () => {
    it("handles an empty list", () => {
      const templates: interfaces.IItemTemplate[] = [];
      const buildOrderIds = deleteSolution._reconstructBuildOrderIds(templates);
      expect(buildOrderIds).toEqual([]);
    });
  });

  describe("_removeItems", () => {
    it("handles an empty list of item ids with all items so far successful", done => {
      const itemIds: string[] = [];
      const hubSiteItemIds: string[] = [];
      const percentDone: number = 50.4;
      const progressPercentStep: number = 10.4;

      deleteSolution
        ._removeItems(
          itemIds,
          hubSiteItemIds,
          MOCK_USER_SESSION,
          percentDone,
          progressPercentStep
        )
        .then(ok => {
          expect(ok).toBeTruthy();
          done();
        }, done.fail);
    });

    it("handles an empty list of item ids with at least one item so far unsuccessful", done => {
      const itemIds: string[] = [];
      const hubSiteItemIds: string[] = [];
      const percentDone: number = 50.4;
      const progressPercentStep: number = 10.4;

      deleteSolution
        ._removeItems(
          itemIds,
          hubSiteItemIds,
          MOCK_USER_SESSION,
          percentDone,
          progressPercentStep,
          {},
          false
        )
        .then(ok => {
          expect(ok).toBeFalsy();
          done();
        }, done.fail);
    });

    it("deletes a list of item ids", done => {
      const firstItemId = "map1234567890";
      const secondItemId = "svc1234567890";
      const itemIds: string[] = [firstItemId, secondItemId];
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

      deleteSolution
        ._removeItems(
          itemIds,
          hubSiteItemIds,
          MOCK_USER_SESSION,
          percentDone,
          progressPercentStep,
          { consoleProgress: true }
        )
        .then(
          ok => {
            expect(ok).toBeTruthy();

            expect(removeItemSpy.calls.count()).toBe(
              2,
              "should call removeItem twice"
            );
            expect(removeItemSpy.calls.argsFor(0)[0]).toEqual(firstItemId);
            expect(removeItemSpy.calls.argsFor(0)[1]).toEqual(
              MOCK_USER_SESSION
            );
            expect(removeItemSpy.calls.argsFor(1)[0]).toEqual(secondItemId);
            expect(removeItemSpy.calls.argsFor(1)[1]).toEqual(
              MOCK_USER_SESSION
            );

            expect(consoleSpy.calls.count()).toBe(
              2,
              "should call console.log twice"
            );
            expect(consoleSpy.calls.argsFor(0)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(0)[1]).toBe(firstItemId);
            expect(consoleSpy.calls.argsFor(0)[2]).toBe("");
            expect(consoleSpy.calls.argsFor(0)[3]).toBe("3 Finished");
            expect(consoleSpy.calls.argsFor(0)[4]).toBe(
              Math.round(percentDone + progressPercentStep) + "%"
            );
            expect(consoleSpy.calls.argsFor(1)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(1)[1]).toBe(secondItemId);
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
      const itemIds: string[] = [firstItemId, secondItemId];
      const hubSiteItemIds: string[] = [];
      const percentDone: number = 50.4;
      const progressPercentStep: number = 10.4;

      const unprotectItemSpy = spyOn(portal, "unprotectItem").and.resolveTo(
        utils.getSuccessResponse()
      );

      const removeItemSpy = spyOn(restHelpers, "removeItem").and.returnValues(
        Promise.reject(utils.getFailureResponse({ id: firstItemId })),
        Promise.resolve(utils.getSuccessResponse({ id: secondItemId }))
      );

      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      utils.setMockDateTime(now);
      const consoleSpy = spyOn(console, "log");

      deleteSolution
        ._removeItems(
          itemIds,
          hubSiteItemIds,
          MOCK_USER_SESSION,
          percentDone,
          progressPercentStep,
          { consoleProgress: true }
        )
        .then(
          ok => {
            expect(ok).toBeFalsy();

            expect(unprotectItemSpy.calls.count()).toBe(
              2,
              "should call unprotectItemSpy twice"
            );
            expect(unprotectItemSpy.calls.argsFor(0)[0]).toEqual({
              id: firstItemId,
              authentication: MOCK_USER_SESSION
            });
            expect(unprotectItemSpy.calls.argsFor(1)[0]).toEqual({
              id: secondItemId,
              authentication: MOCK_USER_SESSION
            });

            expect(removeItemSpy.calls.count()).toBe(
              2,
              "should call removeItem twice"
            );
            expect(removeItemSpy.calls.argsFor(0)[0]).toEqual(firstItemId);
            expect(removeItemSpy.calls.argsFor(0)[1]).toEqual(
              MOCK_USER_SESSION
            );
            expect(removeItemSpy.calls.argsFor(1)[0]).toEqual(secondItemId);
            expect(removeItemSpy.calls.argsFor(1)[1]).toEqual(
              MOCK_USER_SESSION
            );

            expect(consoleSpy.calls.count()).toBe(
              2,
              "should call console.log twice"
            );
            expect(consoleSpy.calls.argsFor(0)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(0)[1]).toBe(firstItemId);
            expect(consoleSpy.calls.argsFor(0)[2]).toBe("");
            expect(consoleSpy.calls.argsFor(0)[3]).toBe("3 Failed");
            expect(consoleSpy.calls.argsFor(0)[4]).toBe(
              Math.round(percentDone + progressPercentStep) + "%"
            );
            expect(consoleSpy.calls.argsFor(1)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(1)[1]).toBe(secondItemId);
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

    it("deletes a list of item ids, skipping a missing one", done => {
      const firstItemId = "map1234567890";
      const secondItemId = "svc1234567890";
      const itemIds: string[] = [firstItemId, secondItemId];
      const hubSiteItemIds: string[] = [];
      const percentDone: number = 50.4;
      const progressPercentStep: number = 10.4;

      const unprotectItemSpy = spyOn(portal, "unprotectItem").and.returnValues(
        Promise.reject(mockItems.get400Failure()),
        Promise.resolve(utils.getSuccessResponse({ id: secondItemId }))
      );

      const removeItemSpy = spyOn(restHelpers, "removeItem").and.resolveTo(
        utils.getSuccessResponse({ id: secondItemId })
      );

      const date = new Date(Date.UTC(2019, 2, 4, 5, 6, 7)); // 0-based month
      const now = date.getTime();
      utils.setMockDateTime(now);
      const consoleSpy = spyOn(console, "log");

      deleteSolution
        ._removeItems(
          itemIds,
          hubSiteItemIds,
          MOCK_USER_SESSION,
          percentDone,
          progressPercentStep,
          { consoleProgress: true }
        )
        .then(
          ok => {
            expect(ok).toBeTruthy();

            expect(unprotectItemSpy.calls.count()).toBe(
              2,
              "should call unprotectItemSpy twice"
            );
            expect(unprotectItemSpy.calls.argsFor(0)[0]).toEqual({
              id: firstItemId,
              authentication: MOCK_USER_SESSION
            });
            expect(unprotectItemSpy.calls.argsFor(1)[0]).toEqual({
              id: secondItemId,
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
            expect(consoleSpy.calls.argsFor(0)[1]).toBe(firstItemId);
            expect(consoleSpy.calls.argsFor(0)[2]).toBe("");
            expect(consoleSpy.calls.argsFor(0)[3]).toBe("3 Ignored");
            expect(consoleSpy.calls.argsFor(0)[4]).toBe(
              Math.round(percentDone + progressPercentStep) + "%"
            );
            expect(consoleSpy.calls.argsFor(1)[0]).toBe(now);
            expect(consoleSpy.calls.argsFor(1)[1]).toBe(secondItemId);
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
  });

  describe("_reportProgress", () => {
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

      deleteSolution._reportProgress(percentDone, deleteOptions);
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

      deleteSolution._reportProgress(
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

      deleteSolution._reportProgress(percentDone, deleteOptions);

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

      deleteSolution._reportProgress(
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

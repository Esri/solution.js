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

import * as arcGISRestJS from "../../src/arcgisRestJS";
import * as deleteSolutionItem from "../../src/deleteHelpers/deleteSolutionItem";
import * as interfaces from "../../src/interfaces";
import * as restHelpers from "../../src/restHelpers";
import * as utils from "../mocks/utils";

let MOCK_USER_SESSION: arcGISRestJS.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `deleteSolutionItem`: functions for deleting a Solution item", () => {

  describe("deleteSolutionItem", () => {
    const itemId = "abc123";
    const owner = "someOwner";

    it("sets protectOptions.owner and calls removeItem with owner when solutionOwner is provided", async () => {
      // Arrange
      const unprotectSpy = spyOn(arcGISRestJS, "unprotectItem").and.callFake(
        (opts: arcGISRestJS.IUserItemOptions) => {
          // Assert inside spy: owner should be set on protectOptions
          expect(opts.id).toBe(itemId);
          expect(opts.authentication).toBe(MOCK_USER_SESSION);
          expect((opts as any).owner).toBe(owner);
          return Promise.resolve({ success: true } as any);
        },
      );

      const removeSpy = spyOn(restHelpers, "removeItem").and.resolveTo({
        success: true,
      } as any);

      // Act
      const result: interfaces.IStatusResponse = await deleteSolutionItem.deleteSolutionItem(
        itemId,
        MOCK_USER_SESSION,
        true,
        owner,
      );

      // Assert: unprotect called once and removeItem called WITH owner
      expect(unprotectSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledWith(itemId, MOCK_USER_SESSION, true, owner);

      // Function returns a normalized response
      expect(result).toEqual({ success: true, itemId });
    });

    it("does NOT set protectOptions.owner and calls removeItem WITHOUT owner when solutionOwner is not provided", async () => {
      // Arrange
      const unprotectSpy = spyOn(arcGISRestJS, "unprotectItem").and.callFake(
        (opts: arcGISRestJS.IUserItemOptions) => {
          // owner should not exist
          expect(opts.id).toBe(itemId);
          expect(opts.authentication).toBe(MOCK_USER_SESSION);
          expect((opts as any).owner).toBeUndefined();
          return Promise.resolve({ success: true } as any);
        },
      );

      const removeSpy = spyOn(restHelpers, "removeItem").and.resolveTo({
        success: true,
      } as any);

      // Act
      const result: interfaces.IStatusResponse = await deleteSolutionItem.deleteSolutionItem(
        itemId,
        MOCK_USER_SESSION,
        false,
        undefined, // no owner
      );

      // Assert: removeItem called WITHOUT owner
      expect(unprotectSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledWith(itemId, MOCK_USER_SESSION, false);

      expect(result).toEqual({ success: true, itemId });
    });

    it("when unprotectItem fails, it does NOT call removeItem (covers the else branch inside the first then)", async () => {
      // Arrange
      spyOn(arcGISRestJS, "unprotectItem").and.resolveTo({
        success: false,
      } as any);

      const removeSpy = spyOn(restHelpers, "removeItem").and.resolveTo({
        success: true,
      } as any);

      // Act
      const result: interfaces.IStatusResponse = await deleteSolutionItem.deleteSolutionItem(
        itemId,
        MOCK_USER_SESSION,
        true,
        owner,
      );

      // Assert
      expect(removeSpy).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, itemId });
    });
  });


});

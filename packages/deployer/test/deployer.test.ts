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

import * as deployer from "../src/deployer";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `deploySolution`", () => {
  describe("deploySolution", () => {
    xit("deploySolution", done => {
      console.warn("========== TODO ==========");
      done.fail();
    });
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

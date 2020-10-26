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

import { simpleTypes } from "@esri/solution-simple-types";
import * as common from "@esri/solution-common";
import * as createProcessor from "../src/create-item-from-template";
import * as utils from "../../common/test/mocks/utils";
import * as templates from "../../common/test/mocks/templates";
import * as hubFormTemplateHelpers from "../src/helpers/is-hub-form-template";
import * as hubFormCreateHelpers from "../src/helpers/create-item-from-hub-template";

describe("createItemFromTemplate", () => {
  let MOCK_USER_SESSION: common.UserSession;
  let template: common.IItemTemplate;
  let templateDictionary: any;

  beforeEach(() => {
    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
    template = templates.getItemTemplate("Form");
    templateDictionary = { key: "value" };
  });

  it("should delegate to custom template processing for Hub Survey templates", done => {
    const expectedResults = {
      item: null as common.IItemTemplate,
      id: "2c36d3679e7f4934ac599051df22daf6",
      type: "Form",
      postProcess: false
    };
    const createItemFromHubTemplateSpy = spyOn(
      hubFormCreateHelpers,
      "createItemFromHubTemplate"
    ).and.resolveTo(expectedResults);
    const isHubFormTemplateSpy = spyOn(
      hubFormTemplateHelpers,
      "isHubFormTemplate"
    ).and.returnValue(true);
    const progressCallback = jasmine.createSpy();
    createProcessor
      .createItemFromTemplate(
        template,
        templateDictionary,
        MOCK_USER_SESSION,
        progressCallback
      )
      .then(
        results => {
          expect(isHubFormTemplateSpy.calls.count()).toBe(1);
          expect(isHubFormTemplateSpy.calls.first().args).toEqual([template]);
          expect(createItemFromHubTemplateSpy.calls.count()).toBe(1);
          expect(createItemFromHubTemplateSpy.calls.first().args).toEqual([
            template,
            templateDictionary,
            MOCK_USER_SESSION,
            progressCallback
          ]);
          expect(results).toEqual(expectedResults);
          done();
        },
        e => {
          done.fail(e);
        }
      );
  });

  it("should delegate to simple types processing for non-Hub Survey templates", done => {
    const expectedResults = {
      item: null as common.IItemTemplate,
      id: "2c36d3679e7f4934ac599051df22daf6",
      type: "Form",
      postProcess: false
    };
    const simpleTypesSpy = spyOn(
      simpleTypes,
      "createItemFromTemplate"
    ).and.resolveTo(expectedResults);
    const isHubFormTemplateSpy = spyOn(
      hubFormTemplateHelpers,
      "isHubFormTemplate"
    ).and.returnValue(false);
    const progressCallback = jasmine.createSpy();
    createProcessor
      .createItemFromTemplate(
        template,
        templateDictionary,
        MOCK_USER_SESSION,
        progressCallback
      )
      .then(
        results => {
          expect(isHubFormTemplateSpy.calls.count()).toBe(1);
          expect(isHubFormTemplateSpy.calls.first().args).toEqual([template]);
          expect(simpleTypesSpy.calls.count()).toBe(1);
          expect(simpleTypesSpy.calls.first().args).toEqual([
            template,
            templateDictionary,
            MOCK_USER_SESSION,
            progressCallback
          ]);
          expect(results).toEqual(expectedResults);
          done();
        },
        e => {
          done.fail(e);
        }
      );
  });
});

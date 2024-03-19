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

import * as common from "@esri/solution-common";
import * as postProcessor from "../src/post-process";
import * as utils from "../../common/test/mocks/utils";
import * as templates from "../../common/test/mocks/templates";
import * as hubFormTemplateHelpers from "../src/helpers/is-hub-form-template";
import * as hubFormProcessingHelpers from "../src/helpers/post-process-survey";
import * as zipUtilsTest from "../../common/test/zip-utils.test";

describe("postProcess", () => {
  let MOCK_USER_SESSION: common.UserSession;
  let template: common.IItemTemplate;
  let templateDictionary: any;
  let itemInfos: any[];

  beforeEach(() => {
    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
    template = templates.getItemTemplate("Form");
    itemInfos = [{ itemId: template.itemId }];
    templateDictionary = { key: "value" };
  });

  it("should delegate to custom template post processing for Hub Survey templates", async () => {
    const formId = "frm1234567890";
    const expectedResults = { success: true };

    const getItemDataSpy = spyOn(common, "getItemDataAsFile").and.resolveTo(await zipUtilsTest.getSampleFormZipFile(formId, "form"));
    const updateItemDataSpy = spyOn(common, "updateItemWithZipObject").and.resolveTo({ success: true });
    const isHubFormTemplateSpy = spyOn(hubFormTemplateHelpers, "isHubFormTemplate").and.returnValue(true);
    const postProcessHubSurveySpy = spyOn(hubFormProcessingHelpers, "postProcessHubSurvey").and.resolveTo(expectedResults);

    const results = await postProcessor.postProcess(
      template.id,
      template.type,
      itemInfos,
      template,
      [template],
      templateDictionary,
      MOCK_USER_SESSION
    );

    expect(getItemDataSpy.calls.count()).toBe(1);
    expect(updateItemDataSpy.calls.count()).toBe(1);
    expect(isHubFormTemplateSpy.calls.count()).toBe(1);
    expect(isHubFormTemplateSpy.calls.first().args).toEqual([template]);
    expect(postProcessHubSurveySpy.calls.count()).toBe(1);
    expect(postProcessHubSurveySpy.calls.first().args).toEqual([
      template.id,
      template.type,
      itemInfos,
      template,
      [template],
      templateDictionary,
      MOCK_USER_SESSION
    ]);
    expect(results).toEqual(expectedResults);
  });

  it("should delegate to common post processing for non-Hub Survey templates", async () => {
    const formId = "frm1234567890";
    const expectedResults = utils.getSuccessResponse({ id: "itm1234567890" });

    const getItemDataSpy = spyOn(common, "getItemDataAsFile").and.resolveTo(await zipUtilsTest.getSampleFormZipFile(formId, "form"));
    const updateItemDataSpy = spyOn(common, "updateItemWithZipObject").and.resolveTo({ success: true });
    const isHubFormTemplateSpy = spyOn(hubFormTemplateHelpers, "isHubFormTemplate").and.returnValue(false);
    const postProcessSpy = spyOn(common, "updateItemTemplateFromDictionary").and.resolveTo({ success: true, id: "itm1234567890" });

    const results = await postProcessor.postProcess(
      template.id,
      template.type,
      itemInfos,
      template,
      [template],
      templateDictionary,
      MOCK_USER_SESSION
    );

    expect(getItemDataSpy.calls.count()).toBe(1);
    expect(updateItemDataSpy.calls.count()).toBe(1);
    expect(isHubFormTemplateSpy.calls.count()).toBe(1);
    expect(postProcessSpy.calls.count()).toBe(1);
    expect(results).toEqual(expectedResults);
  });

  it("should try again if the first attempt to update the item fails", async () => {
    const formId = "frm1234567890";
    const expectedResults = utils.getSuccessResponse({ id: "itm1234567890" });
    let igetItemDataAsFile = 0;

    const getItemDataSpy = spyOn(common, "getItemDataAsFile").and.callFake(async (): Promise<any> => {
      if (igetItemDataAsFile === 0) {
        igetItemDataAsFile++;
        return Promise.resolve(null);
      } else {
        return await zipUtilsTest.getSampleFormZipFile(formId, "form");
      }
    });
    const updateItemDataSpy = spyOn(common, "updateItemWithZipObject").and.resolveTo({ success: true });
    const isHubFormTemplateSpy = spyOn(hubFormTemplateHelpers, "isHubFormTemplate").and.returnValue(false);
    const postProcessSpy = spyOn(common, "updateItemTemplateFromDictionary").and.resolveTo({ success: true, id: "itm1234567890" });

    const results = await postProcessor.postProcess(
      template.id,
      template.type,
      itemInfos,
      template,
      [template],
      templateDictionary,
      MOCK_USER_SESSION
    );

    expect(getItemDataSpy.calls.count()).toBe(2);
    expect(updateItemDataSpy.calls.count()).toBe(1);
    expect(isHubFormTemplateSpy.calls.count()).toBe(1);
    expect(postProcessSpy.calls.count()).toBe(1);
    expect(results).toEqual(expectedResults);
  });
});

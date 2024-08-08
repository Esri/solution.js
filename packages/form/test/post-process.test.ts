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
import * as formUtils from "../src/formUtils";
import * as hubFormProcessingHelpers from "../src/helpers/post-process-survey";
import * as hubFormTemplateHelpers from "../src/helpers/is-hub-form-template";
import * as postProcessor from "../src/post-process";
import * as templates from "../../common/test/mocks/templates";
import * as utils from "../../common/test/mocks/utils";
import * as zipHelpers from "../../common/test/mocks/zipHelpers";

describe("post-process", () => {
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

      const getItemDataSpy = spyOn(common, "getItemDataAsFile").and.resolveTo(
        await zipHelpers.getSampleFormZipFile(formId, "form"),
      );
      const updateItemDataSpy = spyOn(common, "updateItemWithZipObject").and.resolveTo({ success: true });
      const isHubFormTemplateSpy = spyOn(hubFormTemplateHelpers, "isHubFormTemplate").and.returnValue(true);
      const postProcessHubSurveySpy = spyOn(hubFormProcessingHelpers, "postProcessHubSurvey").and.resolveTo(
        expectedResults,
      );

      const results = await postProcessor.postProcess(
        template.id,
        template.type,
        itemInfos,
        template,
        [template],
        templateDictionary,
        MOCK_USER_SESSION,
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
        MOCK_USER_SESSION,
      ]);
      expect(results).toEqual(expectedResults);
    });

    it("should delegate to common post processing for non-Hub Survey templates", async () => {
      const formId = "frm1234567890";
      const expectedResults = utils.getSuccessResponse({ id: "itm1234567890" });

      const getItemDataSpy = spyOn(common, "getItemDataAsFile").and.resolveTo(
        await zipHelpers.getSampleFormZipFile(formId, "form"),
      );
      const updateItemDataSpy = spyOn(common, "updateItemWithZipObject").and.resolveTo({ success: true });
      const isHubFormTemplateSpy = spyOn(hubFormTemplateHelpers, "isHubFormTemplate").and.returnValue(false);
      const postProcessSpy = spyOn(common, "updateItemTemplateFromDictionary").and.resolveTo({
        success: true,
        id: "itm1234567890",
      });

      const results = await postProcessor.postProcess(
        template.id,
        template.type,
        itemInfos,
        template,
        [template],
        templateDictionary,
        MOCK_USER_SESSION,
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
          return zipHelpers.getSampleFormZipFile(formId, "form");
        }
      });
      const updateItemDataSpy = spyOn(common, "updateItemWithZipObject").and.resolveTo({ success: true });
      const isHubFormTemplateSpy = spyOn(hubFormTemplateHelpers, "isHubFormTemplate").and.returnValue(false);
      const postProcessSpy = spyOn(common, "updateItemTemplateFromDictionary").and.resolveTo({
        success: true,
        id: "itm1234567890",
      });

      const results = await postProcessor.postProcess(
        template.id,
        template.type,
        itemInfos,
        template,
        [template],
        templateDictionary,
        MOCK_USER_SESSION,
      );

      expect(getItemDataSpy.calls.count()).toBe(2);
      expect(updateItemDataSpy.calls.count()).toBe(1);
      expect(isHubFormTemplateSpy.calls.count()).toBe(1);
      expect(postProcessSpy.calls.count()).toBe(1);
      expect(results).toEqual(expectedResults);
    });
  });

  describe("postProcessFormItems", () => {
    it("should call postProcess for each item", async () => {
      const templates: any[] = [
        {
          itemId: "frm1234567890",
          type: "Form",
          item: {
            name: "item1",
          },
          data: await zipHelpers.getSampleFormZipFile("frm1234567890", "form"),
          resources: [],
        },
        {
          itemId: "map1234567890",
          type: "Web Map",
          item: {
            name: "item2",
          },
          data: {},
          resources: [],
        },
      ];
      const templateDictionary: any = {};

      const templatizedFormData = zipHelpers.generateFormZipObject("frm1234567890");
      const templatizeFormDataSpy = spyOn(formUtils, "templatizeFormData").and.resolveTo(templatizedFormData);

      const result = await postProcessor.postProcessFormItems(templates, templateDictionary);

      expect(templatizeFormDataSpy.calls.count()).toBe(1);
      expect(typeof result[0].dataFile.file).toBe("object");
      result[0].dataFile.file = null;
      expect(result).toEqual([
        {
          itemId: "frm1234567890",
          type: "Form",
          item: {
            name: "item1",
          },
          data: null,
          resources: ["frm1234567890_info_data/item1"],
          dataFile: {
            itemId: "frm1234567890",
            file: null,
            folder: "frm1234567890_info_data",
            filename: "item1",
          },
        },
        {
          itemId: "map1234567890",
          type: "Web Map",
          item: {
            name: "item2",
          },
          data: {},
          resources: [],
        },
      ] as any[]);
    });
  });

  describe("_getFormDataFilename", () => {
    it("should use the template's item name for the form data name", () => {
      const itemName = "itemName";
      const dataFilename = "dataFilename";
      const itemIdAsName = "itemIdAsName";
      const formDataName = postProcessor._getFormDataFilename(itemName, dataFilename, itemIdAsName);
      expect(formDataName).toEqual(itemName);
    });

    it("should use the template's file data name for the form data name", () => {
      const itemName = "";
      const dataFilename = "dataFilename";
      const itemIdAsName = "itemIdAsName";
      const formDataName = postProcessor._getFormDataFilename(itemName, dataFilename, itemIdAsName);
      expect(formDataName).toEqual(dataFilename);
    });

    it("should use the template's id to create a name for the form data name--'undefined' file name", () => {
      const itemName = "";
      const dataFilename = "undefined";
      const itemIdAsName = "itemIdAsName";
      postProcessor._getFormDataFilename(itemName, dataFilename, itemIdAsName);
      expect(itemIdAsName).toEqual(itemIdAsName);
    });

    it("should use the template's id to create a name for the form data name", () => {
      const itemName = "";
      const dataFilename = "";
      const itemIdAsName = "itemIdAsName";
      postProcessor._getFormDataFilename(itemName, dataFilename, itemIdAsName);
      expect(itemIdAsName).toEqual(itemIdAsName);
    });
  });
});

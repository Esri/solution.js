/** @license
 * Copyright 2020 Esri
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
import * as webappProcessor from "../../src/webapp/webapp-processor";
import * as convertGenericHelper from "../../src/helpers/convert-generic-item-to-template";
import * as refineHelpers from "../../src/webapp/refine-webapp-template";

import * as createItemFromTemplateModule from "../../src/helpers/create-item-from-template";

import * as templatizeObjectModule from "../../src/webapp/_templatizeObject";
import * as templatizeObjectArrayModule from "../../src/webapp/_templatizeObjectArray";
import { getProp, cloneObject } from "@esri/hub-common";

let MOCK_USER_SESSION: common.UserSession;

describe("webapp :: webapp-processor ::", () => {
  describe("createItemFromTemplate :: ", () => {
    it("defers to simpleTypesHelper", () => {
      const fakeResult = {} as common.ICreateItemFromTemplateResponse;
      const createItemSpy = spyOn(
        createItemFromTemplateModule,
        "createItemFromTemplate"
      ).and.resolveTo(fakeResult);
      // fake this as minimally as possible
      return webappProcessor
        .createItemFromTemplate(
          {} as common.IItemTemplate,
          {},
          MOCK_USER_SESSION,
          {} as common.IItemProgressCallback
        )
        .then(() => {
          // we're just ensuring that it calls through
          expect(createItemSpy.calls.count()).toBe(
            1,
            "should delegate to shared function"
          );
        });
    });
  });

  describe("postProcessFieldReferences :: ", () => {
    //
    // NOTE: These tests just verify delegation to templatizing functions
    //
    let tmplObjSpy: any;
    let tmplArrySpy: any;
    beforeEach(() => {
      tmplObjSpy = spyOn(
        templatizeObjectModule,
        "_templatizeObject"
      ).and.callFake((ds, dsi) => {
        const clone = cloneObject(ds);
        clone.chk = true;
        return clone;
      });
      tmplArrySpy = spyOn(
        templatizeObjectArrayModule,
        "_templatizeObjectArray"
      ).and.callFake((objs, dsi) => {
        const clone = cloneObject(objs);
        return clone;
      });
    });

    it("does nothing if template has nothing to process", () => {
      const tmpl = {
        data: {}
      } as common.IItemTemplate;
      const dataSourceInfos: common.IDatasourceInfo[] = [];

      webappProcessor.postProcessFieldReferences(
        tmpl,
        dataSourceInfos,
        "Web Mapping Application"
      );

      expect(tmplObjSpy.calls.count()).toBe(
        0,
        "should not templatize anything"
      );
      expect(tmplArrySpy.calls.count()).toBe(
        0,
        "should not templatize anything"
      );
    });
    it("templateizes datasources", () => {
      const tmpl = {
        data: {
          dataSource: {
            dataSources: {
              foo: {},
              bar: {}
            }
          }
        }
      } as common.IItemTemplate;
      const dataSourceInfos: common.IDatasourceInfo[] = [];

      const chk = webappProcessor.postProcessFieldReferences(
        tmpl,
        dataSourceInfos,
        "Web Mapping Application"
      );

      expect(tmplObjSpy.calls.count()).toBe(
        2,
        "should call templatizeObject for each key on dataSources"
      );
      expect(getProp(chk, "data.dataSource.dataSources.foo").chk).toBeTrue();
      expect(tmplArrySpy.calls.count()).toBe(
        0,
        "should not templatize widgets"
      );
    });

    it("templateizes values", () => {
      const tmpl = {
        data: {
          values: {
            name: "garth"
          }
        }
      } as common.IItemTemplate;
      const dataSourceInfos: common.IDatasourceInfo[] = [];

      const chk = webappProcessor.postProcessFieldReferences(
        tmpl,
        dataSourceInfos,
        "Web Mapping Application"
      );

      expect(tmplObjSpy.calls.count()).toBe(
        1,
        "should call templatizeObject for data.values"
      );
      expect(getProp(chk, "data.values").chk).toBeTrue();
      expect(tmplArrySpy.calls.count()).toBe(
        0,
        "should not templatize widgets"
      );
    });

    it("templatizes widgetPool and widgetOnScreen", () => {
      const tmpl = {
        data: {
          widgetPool: {
            widgets: [{ id: "bar" }, { id: "baz" }]
          },
          widgetOnScreen: {
            widgets: [{ id: "luke" }, { id: "darth" }]
          }
        }
      } as common.IItemTemplate;
      const dataSourceInfos: common.IDatasourceInfo[] = [];

      webappProcessor.postProcessFieldReferences(
        tmpl,
        dataSourceInfos,
        "Web Mapping Application"
      );

      expect(tmplObjSpy.calls.count()).toBe(
        0,
        "should not call templatizeObject dataSources"
      );
      expect(tmplArrySpy.calls.count()).toBe(2, "should templatize widgets");
    });
  });

  describe("convertItemToTemplate :: ", () => {
    it("should call generic converter then refine it", () => {
      const convertSpy = spyOn(
        convertGenericHelper,
        "convertGenericItemToTemplate"
      ).and.resolveTo();

      const refineSpy = spyOn(
        refineHelpers,
        "refineWebAppTemplate"
      ).and.resolveTo();

      return webappProcessor
        .convertItemToTemplate("3ef", {}, MOCK_USER_SESSION)
        .then(() => {
          expect(convertSpy.calls.count()).toBe(
            1,
            "should call generic converter"
          );
          expect(refineSpy.calls.count()).toBe(
            1,
            "should call QC specific converter"
          );
        });
    });
  });

  describe("fineTuneCreatedItem :: ", () => {
    const originalTemplate = {
      itemId: "itm1234567890",
      type: "Web Mapping Application",
      key: "abcdefgh",
      item: {
        tags: [
          "Early Voting",
          "Voting",
          "Polling Places",
          "Ballots",
          "Secretary of State",
          "Voting Centers"
        ],
        title: "Voting Centers",
        typeKeywords: ["Map", "Mapping Site", "Online Map"]
      } as any,
      data: {} as any,
      resources: [] as any[],
      dependencies: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    } as common.IItemTemplate;

    const itemToRefine = {
      itemId: "wab1234567890",
      type: "Web Mapping Application",
      key: "ijklmnop",
      item: {
        tags: [],
        title: "Voting Centers",
        typeKeywords: ["Map", "Mapping Site", "Online Map"]
      } as any,
      data: {} as any,
      resources: [] as any[],
      dependencies: [] as string[],
      properties: {} as any,
      estimatedDeploymentCostFactor: 0
    } as common.IItemTemplate;
    const templateDictionary = {
      folderId: "fld1234567890"
    };
    it("does not create code attachemnt for non-wab items", done => {
      const createItemSpy = spyOn(common, "createItemWithData").and.resolveTo({
        success: true,
        id: "3ef",
        folder: null
      });

      const tmpl = cloneObject(originalTemplate);
      const newItem = cloneObject(itemToRefine);

      return webappProcessor
        .fineTuneCreatedItem(
          tmpl,
          newItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          expect(createItemSpy.calls.count()).toBe(
            0,
            "should not create code attachment item"
          );
          done();
        });
    });

    it("does create code attachemnt for wab items", done => {
      const createItemSpy = spyOn(common, "createItemWithData").and.resolveTo({
        success: true,
        id: "3ef",
        folder: null
      });
      const updateItemSpy = spyOn(common, "updateItem").and.resolveTo({
        success: true,
        id: "wab1234567890"
      });

      const tmpl = cloneObject(originalTemplate);
      const newItem = cloneObject(itemToRefine);
      // add WAB keywords
      tmpl.item.typeKeywords = ["WAB2D"];
      newItem.item.typeKeywords = ["WAB2D"];

      return webappProcessor
        .fineTuneCreatedItem(
          tmpl,
          newItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          expect(createItemSpy.calls.count()).toBe(
            1,
            "should create code attachment item"
          );
          expect(updateItemSpy.calls.count()).toBe(
            1,
            "should update newly created item"
          );
          done();
        });
    });

    it("handles failure to create code attachment", done => {
      const createItemSpy = spyOn(common, "createItemWithData").and.rejectWith({
        success: false
      });
      const updateItemSpy = spyOn(common, "updateItem").and.resolveTo({
        success: true,
        id: "wab1234567890"
      });

      const tmpl = cloneObject(originalTemplate);
      const newItem = cloneObject(itemToRefine);
      // add WAB keywords
      tmpl.item.typeKeywords = ["WAB2D"];
      newItem.item.typeKeywords = ["WAB2D"];

      return webappProcessor
        .fineTuneCreatedItem(
          tmpl,
          newItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          expect(createItemSpy.calls.count()).toBe(
            1,
            "should create code attachment item"
          );
          expect(updateItemSpy.calls.count()).toBe(
            1,
            "should update newly created item"
          );
          done();
        });
    });

    it("handles failure to update item attachment", done => {
      const createItemSpy = spyOn(common, "createItemWithData").and.resolveTo({
        success: true,
        id: "3ef",
        folder: null
      });
      const updateItemSpy = spyOn(common, "updateItem").and.rejectWith({
        success: false
      });

      const tmpl = cloneObject(originalTemplate);
      const newItem = cloneObject(itemToRefine);
      // add WAB keywords
      tmpl.item.typeKeywords = ["WAB2D"];
      newItem.item.typeKeywords = ["WAB2D"];

      return webappProcessor
        .fineTuneCreatedItem(
          tmpl,
          newItem,
          templateDictionary,
          MOCK_USER_SESSION
        )
        .then(() => {
          expect(createItemSpy.calls.count()).toBe(
            1,
            "should create code attachment item"
          );
          expect(updateItemSpy.calls.count()).toBe(
            1,
            "should update newly created item"
          );
          done();
        });
    });
  });
});

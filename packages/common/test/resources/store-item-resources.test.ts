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

import * as interfaces from "../../src/interfaces";
import * as templates from "../mocks/templates";
import * as utils from "../mocks/utils";
import * as mockItems from "../mocks/agolItems";
import * as fetchMock from "fetch-mock";
import * as restHelpersModule from "../../src/restHelpersGet";
import * as resourceHelpersModule from "../../src/resourceHelpers";
import { storeItemResources } from "../../src/resources/store-item-resources";
import * as staticRelatedItemsMocks from "../mocks/staticRelatedItemsMocks";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("storeItemResources :: ", () => {
  describe("using spies :: ", () => {
    it("stores resources", () => {
      const getResSpy = spyOn(
        restHelpersModule,
        "getItemResources"
      ).and.resolveTo({
        total: 4,
        start: 1,
        num: 0,
        nextStart: -1,
        resources: [
          {
            resource: "some-image.jpeg",
            created: 1591306005000,
            size: 207476,
            access: "inherit"
          },
          {
            resource: "foo.json",
            created: 1591306006000,
            size: 37348,
            access: "inherit"
          }
        ]
      });

      const copyFilesSpy = spyOn(
        resourceHelpersModule,
        "copyFilesToStorageItem"
      ).and.resolveTo(["bc3/some-image.jpeg", "bc3/foo.json", ""]);

      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = "bc3";
      itemTemplate.type = "Web Mapping Application";

      return storeItemResources(itemTemplate, "4de", MOCK_USER_SESSION).then(
        response => {
          expect(Array.isArray(response)).toBe(true, "should return an array");
          expect(response.length).toBe(
            3, // metadata.xml is added automatically
            "filter out empty responses from copyFilesToStorageItem"
          );
          expect(response[0]).toBe(
            "bc3/some-image.jpeg",
            "should return full path of the file in the storage item"
          );
          expect(getResSpy.calls.count()).toBe(1, "should get resources");
          expect(getResSpy.calls.argsFor(0)[0]).toBe(
            "bc3",
            "should get resources for template item"
          );
          expect(copyFilesSpy.calls.count()).toBe(
            1,
            "should copy files to solution"
          );
        }
      );
    });

    it("filters out storymap resources", () => {
      // StoryMaps has a pair of resources (oembed.json, oembed.xml draft_*.json) that must be
      // interpolated and can not be directly copied, so they must be filtered out. Sub-optimal
      // as it spreads type specific logic around the app, but until we refactor how resources
      // are handled, this is necessary
      const getResSpy = spyOn(
        restHelpersModule,
        "getItemResources"
      ).and.resolveTo({
        total: 4,
        start: 1,
        num: 0,
        nextStart: -1,
        resources: [
          {
            resource: "some-image.jpeg",
            created: 1591306005000,
            size: 207476,
            access: "inherit"
          },
          {
            resource: "oembed.xml",
            created: 1591306005000,
            size: 13850,
            access: "inherit"
          },
          {
            resource: "oembed.json",
            created: 1591306006000,
            size: 37348,
            access: "inherit"
          },
          {
            resource: "draft_1231323.json",
            created: 1591306006000,
            size: 37348,
            access: "inherit"
          }
        ]
      });

      const copyFilesSpy = spyOn(
        resourceHelpersModule,
        "copyFilesToStorageItem"
      ).and.resolveTo(["bc3/some-image.jpeg", ""]);

      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = "bc3";
      itemTemplate.type = "StoryMap";

      return storeItemResources(itemTemplate, "4de", MOCK_USER_SESSION).then(
        response => {
          expect(Array.isArray(response)).toBe(true, "should return an array");
          expect(response.length).toBe(
            2, // metadata.xml is added automatically
            "filter out unwanted storymap files"
          );
          expect(response[0]).toBe(
            "bc3/some-image.jpeg",
            "should return full path of the file in the storage item"
          );
          expect(getResSpy.calls.count()).toBe(1, "should get resources");
          expect(getResSpy.calls.argsFor(0)[0]).toBe(
            "bc3",
            "should get resources for template item"
          );
          expect(copyFilesSpy.calls.count()).toBe(
            1,
            "should copy files to solution"
          );
        }
      );
    });

    it("filters out web-experience resources", () => {
      // Web Experience has one or more draft resources that we filter out.
      // Sub-optimal as it spreads  type specific logic around the app, but until
      // we refactor how resources are handled, this is necessary
      const getResSpy = spyOn(
        restHelpersModule,
        "getItemResources"
      ).and.resolveTo({
        total: 4,
        start: 1,
        num: 0,
        nextStart: -1,
        resources: [
          {
            resource: "some-image.jpeg",
            created: 1591306005000,
            size: 207476,
            access: "inherit"
          },
          {
            resource: "config/config.json",
            created: 1591306005000,
            size: 13850,
            access: "inherit"
          },
          {
            resource: "images/image-resources-list.json",
            created: 1591306006000,
            size: 37348,
            access: "inherit"
          },
          {
            resource: "images/draft_1231323.json",
            created: 1591306006000,
            size: 37348,
            access: "inherit"
          }
        ]
      });

      const copyFilesSpy = spyOn(
        resourceHelpersModule,
        "copyFilesToStorageItem"
      ).and.resolveTo(["bc3/some-image.jpeg"]);

      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.itemId = "bc3";
      itemTemplate.type = "Web Experience";

      return storeItemResources(itemTemplate, "4de", MOCK_USER_SESSION).then(
        response => {
          expect(Array.isArray(response)).toBe(true, "should return an array");
          expect(response.length).toBe(
            1,
            "filter out empty responses from copyFilesToStorageItem"
          );
          expect(response[0]).toBe(
            "bc3/some-image.jpeg",
            "should return full path of the file in the storage item"
          );
          expect(getResSpy.calls.count()).toBe(1, "should get resources");
          expect(getResSpy.calls.argsFor(0)[0]).toBe(
            "bc3",
            "should get resources for template item"
          );
          expect(copyFilesSpy.calls.count()).toBe(
            1,
            "should copy files to solution"
          );
        }
      );
    });
  });

  describe("storeItemResources, template version 0", () => {
    it("can update item resources for quick capture project", done => {
      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem("QuickCapture Project", null);
      itemTemplate.itemId = itemTemplate.item.id;
      const solutionItemId = "ee67658b2a98450cba051fd001463df0";

      const resources: any = {
        total: 1,
        start: 1,
        num: 1,
        nextStart: -1,
        resources: [
          {
            resource: "qc.project.json",
            created: 1579127879000,
            size: 29882,
            access: "inherit",
            type: "application/json"
          }
        ]
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/resources",
          resources
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/info/metadata/metadata.xml",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/info/thumbnail/ago_downloaded.png?w=400",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/resources/qc.project.json",
          {}
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/ee67658b2a98450cba051fd001463df0/addResources",
          utils.getSuccessResponse()
        );

      const expected: string[] = [
        "qck1234567890_info_thumbnail/ago_downloaded.png",
        "qck1234567890/qc.project.json"
      ];

      return storeItemResources(
        itemTemplate,
        solutionItemId,
        MOCK_USER_SESSION
      ).then(actual => {
        expect(actual).toEqual(expected);
        done();
      }, done.fail);
    });

    it("can update item resources for web map", done => {
      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem("Web Map", null);
      itemTemplate.itemId = itemTemplate.item.id;
      itemTemplate.item.thumbnail = "thumbnail/banner.png";
      const solutionItemId = "ee67658b2a98450cba051fd001463df0";

      const expectedFetch = utils.getSampleImageAsBlob();

      const resources: any = {
        total: 1,
        start: 1,
        num: 1,
        nextStart: -1,
        resources: [
          {
            resource: "image/banner.png",
            created: 1522711362000,
            size: 56945
          }
        ]
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          resources
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources/image/banner.png",
          expectedFetch,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/" +
            MOCK_USER_SESSION.username +
            "/items/" +
            solutionItemId +
            "/addResources",
          {
            success: true,
            itemId: solutionItemId,
            owner: MOCK_USER_SESSION.username,
            folder: null
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/thumbnail/banner.png?w=400",
          expectedFetch,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        );
      staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
        total: 0,
        relatedItems: []
      });

      const expected: string[] = [
        "map1234567890_image/banner.png",
        "map1234567890_info_thumbnail/banner.png"
      ];

      return storeItemResources(
        itemTemplate,
        solutionItemId,
        MOCK_USER_SESSION
      ).then(actual => {
        expect(actual).toEqual(expected);
        done();
      }, done.fail);
    });

    it("can store item resources for a form", done => {
      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplate(
        "Form"
      );
      itemTemplate.item.thumbnail = "thumbnail/banner.png";
      const solutionItemId = "ee67658b2a98450cba051fd001463df0";

      const resources: any = {
        total: 0,
        start: 1,
        num: 0,
        nextStart: -1,
        resources: []
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          resources
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/" +
            MOCK_USER_SESSION.username +
            "/items/" +
            solutionItemId +
            "/addResources",
          {
            success: true,
            itemId: solutionItemId,
            owner: MOCK_USER_SESSION.username,
            folder: null
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/thumbnail/banner.png?w=400",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        );

      staticRelatedItemsMocks.fetchMockRelatedItems(itemTemplate.itemId, {
        total: 0,
        relatedItems: []
      });

      const expected: string[] = ["frm1234567890_info_thumbnail/banner.png"];

      return storeItemResources(
        itemTemplate,
        solutionItemId,
        MOCK_USER_SESSION
      ).then(actual => {
        expect(actual).toEqual(expected);
        done();
      }, done.fail);
    });

    it("can handle error on add resources", done => {
      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem("Web Map", null);
      itemTemplate.itemId = itemTemplate.item.id;
      itemTemplate.item.thumbnail = null;
      const solutionItemId = "ee67658b2a98450cba051fd001463df0";

      const expectedFetch = utils.getSampleImageAsBlob();

      const resources: any = {
        total: 1,
        start: 1,
        num: 1,
        nextStart: -1,
        resources: [
          {
            resource: "image/banner.png",
            created: 1522711362000,
            size: 56945
          }
        ]
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          resources
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources/image/banner.png",
          expectedFetch,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/" +
            MOCK_USER_SESSION.username +
            "/items/" +
            solutionItemId +
            "/addResources",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/thumbnail/banner.png?w=400",
          expectedFetch,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        );

      return storeItemResources(itemTemplate, solutionItemId, MOCK_USER_SESSION)
        .then(actual => {
          expect(actual).toEqual([]);
          // expect(fetchMock.done()).toBe(
          //   true,
          //   "should use all the fetch mocks"
          // );
          done();
        })
        .catch(ex => {
          done.fail(ex);
        });
    });
  });

  describe("storeItemResources, template version 1", () => {
    it("can update item resources for quick capture project", done => {
      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem("QuickCapture Project", null);
      itemTemplate.itemId = itemTemplate.item.id;
      const solutionItemId = "ee67658b2a98450cba051fd001463df0";

      const resources: any = {
        total: 1,
        start: 1,
        num: 1,
        nextStart: -1,
        resources: [
          {
            resource: "qc.project.json",
            created: 1579127879000,
            size: 29882,
            access: "inherit",
            type: "application/json"
          }
        ]
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/resources",
          resources
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/info/metadata/metadata.xml",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/info/thumbnail/ago_downloaded.png?w=400",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/qck1234567890/resources/qc.project.json",
          {}
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/casey/items/ee67658b2a98450cba051fd001463df0/addResources",
          utils.getSuccessResponse()
        );

      const expected: string[] = [
        "qck1234567890_info_thumbnail/ago_downloaded.png",
        "qck1234567890/qc.project.json"
      ];

      return storeItemResources(
        itemTemplate,
        solutionItemId,
        MOCK_USER_SESSION,
        1
      ).then(actual => {
        expect(actual).toEqual(expected);
        done();
      }, done.fail);
    });

    it("can update item resources for web map", done => {
      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem("Web Map", null);
      itemTemplate.itemId = itemTemplate.item.id;
      itemTemplate.item.thumbnail = "thumbnail/banner.png";
      const solutionItemId = "ee67658b2a98450cba051fd001463df0";

      const expectedFetch = utils.getSampleImageAsBlob();

      const resources: any = {
        total: 1,
        start: 1,
        num: 1,
        nextStart: -1,
        resources: [
          {
            resource: "image/banner.png",
            created: 1522711362000,
            size: 56945
          }
        ]
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          resources
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources/image/banner.png",
          expectedFetch,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/" +
            MOCK_USER_SESSION.username +
            "/items/" +
            solutionItemId +
            "/addResources",
          {
            success: true,
            itemId: solutionItemId,
            owner: MOCK_USER_SESSION.username,
            folder: null
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/thumbnail/banner.png?w=400",
          expectedFetch,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        );
      staticRelatedItemsMocks.fetchMockRelatedItems("map1234567890", {
        total: 0,
        relatedItems: []
      });

      const expected: string[] = [
        "map1234567890/image/banner.png",
        "map1234567890_info_thumbnail/banner.png"
      ];

      return storeItemResources(
        itemTemplate,
        solutionItemId,
        MOCK_USER_SESSION,
        1
      ).then(actual => {
        expect(actual).toEqual(expected);
        done();
      }, done.fail);
    });

    it("can store item resources for a form", done => {
      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplate(
        "Form"
      );
      itemTemplate.item.thumbnail = "thumbnail/banner.png";
      const solutionItemId = "ee67658b2a98450cba051fd001463df0";

      const resources: any = {
        total: 0,
        start: 1,
        num: 0,
        nextStart: -1,
        resources: []
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          resources
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/" +
            MOCK_USER_SESSION.username +
            "/items/" +
            solutionItemId +
            "/addResources",
          {
            success: true,
            itemId: solutionItemId,
            owner: MOCK_USER_SESSION.username,
            folder: null
          }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/thumbnail/banner.png?w=400",
          utils.getSampleImageAsBlob(),
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        );

      staticRelatedItemsMocks.fetchMockRelatedItems(itemTemplate.itemId, {
        total: 0,
        relatedItems: []
      });

      const expected: string[] = ["frm1234567890_info_thumbnail/banner.png"];

      return storeItemResources(
        itemTemplate,
        solutionItemId,
        MOCK_USER_SESSION,
        1
      ).then(actual => {
        expect(actual).toEqual(expected);
        done();
      }, done.fail);
    });

    it("can handle error on add resources", done => {
      const itemTemplate: interfaces.IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item = mockItems.getAGOLItem("Web Map", null);
      itemTemplate.itemId = itemTemplate.item.id;
      itemTemplate.item.thumbnail = null;
      const solutionItemId = "ee67658b2a98450cba051fd001463df0";

      const expectedFetch = utils.getSampleImageAsBlob();

      const resources: any = {
        total: 1,
        start: 1,
        num: 1,
        nextStart: -1,
        resources: [
          {
            resource: "image/banner.png",
            created: 1522711362000,
            size: 56945
          }
        ]
      };

      fetchMock
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources",
          resources
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/resources/image/banner.png",
          expectedFetch,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/users/" +
            MOCK_USER_SESSION.username +
            "/items/" +
            solutionItemId +
            "/addResources",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/thumbnail/banner.png?w=400",
          expectedFetch,
          { sendAsJson: false }
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/data",
          mockItems.get500Failure()
        )
        .post(
          utils.PORTAL_SUBSET.restUrl +
            "/content/items/" +
            itemTemplate.itemId +
            "/info/metadata/metadata.xml",
          mockItems.get400Failure()
        );

      return storeItemResources(
        itemTemplate,
        solutionItemId,
        MOCK_USER_SESSION,
        1
      )
        .then(actual => {
          expect(actual).toEqual([]);
          // expect(fetchMock.done()).toBe(
          //   true,
          //   "should use all the fetch mocks"
          // );
          done();
        })
        .catch(ex => {
          done.fail(ex);
        });
    });
  });
});

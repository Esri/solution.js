import * as portalModule from "@esri/arcgis-rest-portal";
import * as hubCommonModule from "@esri/hub-common";
import * as utils from "../../../common/test/mocks/utils";

import { createStoryMap } from "../../src/helpers/create-storymap";

const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

describe("createStoryMap ::", () => {
  // Blobs are only available in the browser
  if (typeof window !== "undefined") {
    it("happy-path", () => {
      // model
      const model = {
        item: {
          id: "3ef",
          owner: "vader"
        } as portalModule.IItem,
        data: {
          // we don't care about whats in here
        },
        properties: {
          draftFileName: "draft_123124123.json",
          oembed: { key: "val" },
          oembedXML: "<xml>This is xml. Really. it is.</xml>"
        }
      } as hubCommonModule.IModel;

      // setup spies
      const createItemSpy = spyOn(portalModule, "createItem").and.resolveTo({
        id: "bc3",
        folder: "some-folder",
        success: true
      });
      const interpolateIdSpy = spyOn(
        hubCommonModule,
        "interpolateItemId"
      ).and.callThrough();
      const updateItemSpy = spyOn(portalModule, "updateItem").and.resolveTo({
        id: "bc3",
        success: true
      });
      const addResSpy = spyOn(portalModule, "addItemResource").and.resolveTo({
        itemId: "bc3",
        owner: "casey",
        folder: "",
        success: true
      });

      return createStoryMap(model, {}, MOCK_USER_SESSION).then(result => {
        expect(createItemSpy.calls.count()).toBe(1, "should create the item");
        expect(interpolateIdSpy.calls.count()).toBe(
          1,
          "should call interpolateId"
        );
        expect(updateItemSpy.calls.count()).toBe(1, "should call updateItem");
        expect(addResSpy.calls.count()).toBe(3, "should add three resources");
      });
    });
  }
});

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

import * as mockTemplates from "./mocks/templates";
import * as fetchMock from "fetch-mock";
import * as interfaces from "../src/interfaces";
import {
  getTackingServiceOwner,
  isTrackingViewTemplate,
  setLocationTrackingEnabled,
  _validateTrackingTemplates,
  templatizeTracker,
  setTrackingOptions
} from "../src/trackingHelpers";
import { IItemTemplate } from "../src/interfaces";
import * as restHelpersGet from "../src/restHelpersGet";
import * as templates from "../../common/test/mocks/templates";
import * as utils from "./mocks/utils";
import * as mockItems from "../test/mocks/agolItems";
import { cloneObject } from "../src/generalHelpers";

// ------------------------------------------------------------------------------------------------------------------ //

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

afterEach(() => {
  fetchMock.restore();
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms


describe("Module `trackingHelpers`: common functions", () => {
  describe("getTackingServiceOwner", () => {
    it("will get tracking info", done => {
      const id = "7ab2bd317dd645308b9d7de3045423c6";
      const owner = "LocationTrackingOwner";
      const templateDictionary: any = {
        locationTrackingEnabled: true,
        locationTracking: { id }
      };
      const expected = false;

      fetchMock
        .get(
          "https://myorg.maps.arcgis.com/sharing/rest/content/items/7ab2bd317dd645308b9d7de3045423c6?f=json&token=fake-token",
          { owner, id }
        );

      const expectedTemplateDict: any = cloneObject(templateDictionary);
      expectedTemplateDict[id] = {
        itemId: id
      };
      expectedTemplateDict.locationTracking.owner = owner;

      getTackingServiceOwner(
        templateDictionary,
        MOCK_USER_SESSION
      ).then(actual => {
        expect(actual).toEqual(expected);
        expect(templateDictionary).toEqual(expectedTemplateDict);
        done();
      })
    });

    it("will handle failure during get tracking info", done => {
      const id = "7ab2bd317dd645308b9d7de3045423c6";
      const owner = "LocationTrackingOwner";
      const templateDictionary: any = {
        locationTrackingEnabled: true,
        locationTracking: { id }
      };

      const baseSpy = spyOn(restHelpersGet, "getItemBase").and.rejectWith(
        mockItems.get400Failure()
      );

      const expectedTemplateDict: any = cloneObject(templateDictionary);
      expectedTemplateDict[id] = {
        itemId: id
      };
      expectedTemplateDict.locationTracking.owner = owner;

      getTackingServiceOwner(
        templateDictionary,
        MOCK_USER_SESSION
      ).then(actual => {
        expect(actual).toEqual(false);
        done();
      })
    });
  });

  describe("isTrackingViewTemplate", () => {
    it("can handle missing typeKeywords and trackViewGroup", () => {
      const itemUpdate = {
        id: "ABC123",
        k: "v"
      };
      const actual = isTrackingViewTemplate(undefined, itemUpdate);
      expect(actual).toEqual(false);
    });
  });

  describe("setLocationTrackingEnabled", () => {
    it("locationTracking false and role not admin", () => {
      const portalResponse: any = {
        helperServices: {
          locationTracking: false
        }
      };
      const userResponse: any = {
        role: "not admin"
      };
      const templateDictionary: any = {};
      const expectedTemplateDictionary: any = {
        locationTrackingEnabled: false
      };

      setLocationTrackingEnabled(
        portalResponse,
        userResponse,
        templateDictionary
      );

      expect(templateDictionary).toEqual(expectedTemplateDictionary);
    });

    it("locationTracking true but role not admin", () => {
      const helperServices = {
        locationTracking: {
          url: "http://locationtracking/FeatureServer",
          id: "abc123"
        }
      };
      const portalResponse: any = {
        helperServices
      };
      const userResponse: any = {
        role: "not admin"
      };
      const templateDictionary: any = {};
      const expectedTemplateDictionary: any = {
        locationTrackingEnabled: false,
        locationTracking: helperServices.locationTracking
      };

      setLocationTrackingEnabled(
        portalResponse,
        userResponse,
        templateDictionary
      );

      expect(templateDictionary).toEqual(expectedTemplateDictionary);
    });

    it("locationTracking false but role admin", () => {
      const portalResponse: any = {
        helperServices: {
          locationTracking: false
        }
      };
      const userResponse: any = {
        role: "org_admin"
      };
      const templateDictionary: any = {};
      const expectedTemplateDictionary: any = {
        locationTrackingEnabled: false
      };

      setLocationTrackingEnabled(
        portalResponse,
        userResponse,
        templateDictionary
      );

      expect(templateDictionary).toEqual(expectedTemplateDictionary);
    });

    it("locationTracking true and role admin", () => {
      const helperServices = {
        locationTracking: {
          url: "http://locationtracking/FeatureServer",
          id: "abc123"
        }
      };
      const portalResponse: any = {
        helperServices
      };
      const userResponse: any = {
        role: "org_admin"
      };
      const templateDictionary: any = {};
      const expectedTemplateDictionary: any = {
        locationTrackingEnabled: true,
        locationTracking: helperServices.locationTracking
      };

      setLocationTrackingEnabled(
        portalResponse,
        userResponse,
        templateDictionary
      );

      expect(templateDictionary).toEqual(expectedTemplateDictionary);
    });

    it("will call _validateTrackingTemplates when templates are provided", () => {
      const helperServices = {
        locationTracking: {
          url: "http://locationtracking/FeatureServer",
          id: "abc123"
        }
      };
      const portalResponse: any = {
        helperServices
      };
      const userResponse: any = {
        role: "org_admin"
      };
      const templateDictionary: any = {};
      const expectedTemplateDictionary: any = {
        locationTrackingEnabled: true,
        locationTracking: helperServices.locationTracking
      };

      setLocationTrackingEnabled(
        portalResponse,
        userResponse,
        templateDictionary
      );

      expect(templateDictionary).toEqual(expectedTemplateDictionary);
    });
  });

  describe("_validateTrackingTemplates", () => {
    it("handles no typeKeywords", () => {
      const templates: IItemTemplate[] = [
        mockTemplates.getItemTemplate("Feature Service")
      ];
      delete templates[0].item.typeKeywords;
      const templateDictionary: any = {
        locationTrackingEnabled: false
      };
      _validateTrackingTemplates(templates, templateDictionary);
      expect(spyOn(console, "error").calls.count()).toEqual(0);
    });

    it("throws error if we have tracking templates and tracking not enabled", () => {
      const templates: IItemTemplate[] = [
        mockTemplates.getItemTemplate("Feature Service")
      ];
      templates[0].item.typeKeywords = ["Location Tracking View"];
      const templateDictionary: any = {
        locationTrackingEnabled: false
      };
      spyOn(console, "error").and.callFake(() => {});
      expect(() =>
        _validateTrackingTemplates(templates, templateDictionary)
      ).toThrow(
        new Error("Location tracking not enabled or user is not admin.")
      );
    });
  });

  describe("templatizeTracker", () => {
    it("should templatize group prop for location tracking views", () => {
      const _itemTemplate: IItemTemplate = templates.getItemTemplateSkeleton();
      _itemTemplate.item.typeKeywords = ["Location Tracking View"];
      _itemTemplate.item.properties = {
        trackViewGroup: "aaad83aae2bc4cec884c165d9d0c9988"
      };
      _itemTemplate.item.name = "aaad83aae2bc4cec884c165d9d0c9988_Track_View";
      _itemTemplate.properties.layers = [{
        adminLayerInfo: {
          viewLayerDefinition: {
            sourceServiceItemId: "bbbd83aae2bc4cec884c165d9d0c9988"
          }
        }
      }];
      templatizeTracker(_itemTemplate);

      expect(_itemTemplate.item.properties.trackViewGroup).toEqual(
        "{{aaad83aae2bc4cec884c165d9d0c9988.itemId}}"
      );
      expect(_itemTemplate.dependencies).toEqual(
        ["aaad83aae2bc4cec884c165d9d0c9988"]
      );
      expect(_itemTemplate.groups).toEqual(
        ["aaad83aae2bc4cec884c165d9d0c9988"]
      );
      expect(
        _itemTemplate.properties.layers[0].adminLayerInfo.viewLayerDefinition.sourceServiceItemId
      ).toEqual("{{bbbd83aae2bc4cec884c165d9d0c9988.itemId}}");
      expect(_itemTemplate.item.name).toEqual(
        "{{aaad83aae2bc4cec884c165d9d0c9988.itemId}}_Track_View"
      );
    });

    it("should handle missing layers", () => {
      const _itemTemplate: IItemTemplate = templates.getItemTemplateSkeleton();
      _itemTemplate.item.typeKeywords = ["Location Tracking View"];
      _itemTemplate.item.properties = {
        trackViewGroup: "aaad83aae2bc4cec884c165d9d0c9988"
      };

      templatizeTracker(_itemTemplate);

      expect(_itemTemplate.item.properties.trackViewGroup).toEqual(
        "{{aaad83aae2bc4cec884c165d9d0c9988.itemId}}"
      );
      expect(_itemTemplate.dependencies).toEqual(
        ["aaad83aae2bc4cec884c165d9d0c9988"]
      );
      expect(_itemTemplate.groups).toEqual(
        ["aaad83aae2bc4cec884c165d9d0c9988"]
      );
    });
  });

  describe("setTrackingOptions", () => {
    it("will set tracking options", () => {
      const itemTemplate: IItemTemplate = templates.getItemTemplateSkeleton();
      itemTemplate.item.typeKeywords = ["Location Tracking View"];
      itemTemplate.item.properties = {
        trackViewGroup: "aaad83aae2bc4cec884c165d9d0c9988"
      };
      itemTemplate.item.name = "aaad83aae2bc4cec884c165d9d0c9988_Track_View";
      const options: any = {
        item: {},
        params: {},
        folderId: "someFolderId"
      };
      const templateDictionary = {
        locationTracking: {
          owner: "TrackingServiceOwner"
        }
      };
      const item = {
        name: "aaad83aae2bc4cec884c165d9d0c9988_Track_View",
        isView: true,
        owner: "TrackingServiceOwner"
      };
      const expected: any = {
        owner: "TrackingServiceOwner",
        item,
        params: {
          isView: true,
          outputType: "locationTrackingService"
        }
      }
      const actual = setTrackingOptions(itemTemplate, options, templateDictionary);
      expect(actual).toEqual(item);
      expect(options).toEqual(expected);
    });
  });
});

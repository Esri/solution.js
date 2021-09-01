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
import {
  setLocationTrackingEnabled,
  _validateTrackingTemplates
} from "../src/trackingHelpers";
import { IItemTemplate } from "../src/interfaces";
import Sinon from "sinon";

describe("Module `trackingHelpers`: common functions", () => {
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
      const portalResponse: any = {
        helperServices: {
          locationTracking: true
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
      const portalResponse: any = {
        helperServices: {
          locationTracking: true
        }
      };
      const userResponse: any = {
        role: "org_admin"
      };
      const templateDictionary: any = {};
      const expectedTemplateDictionary: any = {
        locationTrackingEnabled: true
      };

      setLocationTrackingEnabled(
        portalResponse,
        userResponse,
        templateDictionary
      );

      expect(templateDictionary).toEqual(expectedTemplateDictionary);
    });

    it("will call _validateTrackingTemplates when templates are provided", () => {
      const portalResponse: any = {
        helperServices: {
          locationTracking: true
        }
      };
      const userResponse: any = {
        role: "org_admin"
      };
      const templateDictionary: any = {};
      const expectedTemplateDictionary: any = {
        locationTrackingEnabled: true
      };

      const templates: IItemTemplate[] = [
        mockTemplates.getItemTemplate("Feature Service")
      ];

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
});

/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import { UserSession } from "@esri/arcgis-rest-auth";

import * as mInterfaces from "../../src/interfaces";
import * as mObjHelpers from "../../src/generalHelpers";

// -------------------------------------------------------------------------------------------------------------------//

const orgUrl = "https://myOrg.maps.arcgis.com";
const portalUrl = "https://www.arcgis.com";

export const TOMORROW = (function() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return now;
})();

export const YESTERDAY = (function() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now;
})();

export const ArcgisRestSuccessFailSimple = {
  success: false
};

export const ArcgisRestSuccessFailStruct = {
  success: false,
  error: {
    success: false
  }
};

export function checkForArcgisRestSuccessRequestError(error: any): boolean {
  return (
    (error &&
      typeof error.success === "boolean" &&
      error.success === false &&
      typeof error.error === "object" &&
      error.error.name === "ArcGISRequestError") ||
    (error && typeof error.success === "boolean" && error.success === false)
  );
}

export function create404Error(errorMessage = "404 error"): any {
  return () => {
    throw new Error(errorMessage);
  };
}

export function createMockSettings(
  solutionName = "",
  folderId = null as string,
  access = "private"
): any {
  const settings: any = {
    organization: {
      orgUrl,
      portalBaseUrl: portalUrl
    },
    solutionName,
    folderId,
    access
  };

  return settings;
}

export function createRuntimeMockUserSession(now: number): UserSession {
  const tomorrow = new Date(now + 86400000);
  return new UserSession({
    clientId: "clientId",
    redirectUri: "https://example-app.com/redirect-uri",
    token: "fake-token",
    tokenExpires: tomorrow,
    refreshToken: "refreshToken",
    refreshTokenExpires: tomorrow,
    refreshTokenTTL: 1440,
    username: "casey",
    password: "123456",
    portal: "https://myorg.maps.arcgis.com/sharing/rest"
  });
}

export function jsonClone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Removes item-specific functions from templates.
 *
 * @param solutionTemplateItem Solution template
 */
export function removeItemFcns(
  solutionTemplateItem: mInterfaces.ISolutionItem
): void {
  const templates = mObjHelpers.getProp(solutionTemplateItem, "data.templates");
  if (templates) {
    if (Array.isArray(templates)) {
      templates.forEach(template => {
        delete template.fcns;
      });
    } else {
      delete templates.fcns;
    }
  }
}

export function removeNameField(layerOrTable: any): any {
  layerOrTable.name = null;
  return layerOrTable;
}

/**
 * Replaces the browser clock with a mock clock.
 *
 * @param now Time to use to set Jasmine clock
 * @note Be sure to call `jasmine.clock().uninstall()` after using this function in a test
 */
export function setMockDateTime(now: number): number {
  jasmine.clock().install();
  jasmine.clock().mockDate(new Date(now));
  return now;
}

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

/**
 * Provides static mock responses for related items across multiple packages.
 *
 * Long term...would like to work these into the standard mocks.
 */

import * as fetchMock from "fetch-mock";

export function fetchMockRelatedItems(
  itemId: string,
  desiredResponse: any,
  excludedTypes?: string[]
): void {
  const relationshipTypes = [
    // from interfaces.ItemRelationshipType
    "Map2Service",
    "WMA2Code",
    "Map2FeatureCollection",
    "MobileApp2Code",
    "Service2Data",
    "Service2Service",
    "Map2AppConfig",
    "Item2Attachment",
    "Item2Report",
    "Listed2Provisioned",
    "Style2Style",
    "Service2Style",
    "Survey2Service",
    "Survey2Data",
    "Service2Route",
    "Area2Package",
    "Map2Area",
    "Service2Layer",
    "Area2CustomPackage",
    "TrackView2Map",
    "SurveyAddIn2Data"
  ];

  // Remove excluded types
  if (excludedTypes) {
    excludedTypes.forEach(typeToRemove => {
      const iTypeToRemove = relationshipTypes.indexOf(typeToRemove);
      if (iTypeToRemove >= 0) {
        relationshipTypes.splice(iTypeToRemove, 1);
      }
    });
  }

  // Set up fetches
  relationshipTypes.forEach(relationshipType => {
    fetchMock.get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=" +
        relationshipType +
        "&token=fake-token",
      desiredResponse
    );
  });
}

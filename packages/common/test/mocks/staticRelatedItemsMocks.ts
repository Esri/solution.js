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
  desiredResponse: any
): void {
  fetchMock
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Area2CustomPackage&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Area2Package&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Item2Attachment&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Item2Report&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Listed2Provisioned&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Map2AppConfig&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Map2Area&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Map2FeatureCollection&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Map2Service&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=MobileApp2Code&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Service2Data&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Service2Layer&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Service2Route&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Service2Service&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Service2Style&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Style2Style&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Survey2Data&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=SurveyAddIn2Data&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=TrackView2Map&token=fake-token",
      desiredResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=WMA2Code&token=fake-token",
      desiredResponse
    );
}

export function fetchMockRelatedItemsSurvey2Service(
  itemId: string,
  defaultResponse: any,
  survey2ServiceResponse: any
): void {
  fetchMock
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Area2CustomPackage&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Area2Package&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Item2Attachment&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Item2Report&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Listed2Provisioned&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Map2AppConfig&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Map2Area&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Map2FeatureCollection&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Map2Service&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=MobileApp2Code&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Service2Data&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Service2Layer&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Service2Route&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Service2Service&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Service2Style&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Style2Style&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Survey2Data&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=Survey2Service&token=fake-token",
      survey2ServiceResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=SurveyAddIn2Data&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=TrackView2Map&token=fake-token",
      defaultResponse
    )
    .get(
      "https://myorg.maps.arcgis.com/sharing/rest/content/items/" +
        itemId +
        "/relatedItems?f=json&direction=forward&relationshipType=WMA2Code&token=fake-token",
      defaultResponse
    );
}

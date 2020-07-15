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
import { replaceUrl } from "../../src/webapp/replaceUrl";

describe("webapp :: replaceUrl :: ", () => {
  it("can replace partial url", () => {
    const url: string = "https://localdeployment.maps.arcgis.com";
    const newUrl: string = "{{portalBaseUrl}}";
    const objString: string = JSON.stringify({
      url: "https://localdeployment.maps.arcgis.com/sharing/rest/content/items/"
    });
    const expected: string = JSON.stringify({
      url: "{{portalBaseUrl}}/sharing/rest/content/items/"
    });
    const actual: string = replaceUrl(objString, url, newUrl);
    expect(actual).toEqual(expected);
  });

  it("can enforce must match full url", () => {
    let objString: any = JSON.stringify({
      url1:
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/0",
      url2:
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/",
      url3:
        "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/1"
    });

    const urls: string[] = [
      "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/0",
      "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/",
      "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/1"
    ];

    const newUrls: string[] = [
      "{{206386ad6806406280093882b5cb049c.layer0.url}}",
      "{{206386ad6806406280093882b5cb049c.url}}",
      "{{206386ad6806406280093882b5cb049c.layer1.url}}"
    ];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const newUrl = newUrls[i];
      objString = replaceUrl(objString, url, newUrl, true);
    }

    const expected: string = JSON.stringify({
      url1: "{{206386ad6806406280093882b5cb049c.layer0.url}}",
      url2: "{{206386ad6806406280093882b5cb049c.url}}",
      url3: "{{206386ad6806406280093882b5cb049c.layer1.url}}"
    });
    expect(objString).toEqual(expected);
  });

  it("can ignore force full url for simple url", () => {
    const urls: string[] = [
      "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/0",
      "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/",
      "https://services7.arcgis.com/piPfTFmrV9d1DIvN/arcgis/rest/services/EducationalFacilities_public/FeatureServer/1"
    ];

    const newUrls: string[] = [
      "{{206386ad6806406280093882b5cb049c.layer0.url}}",
      "{{206386ad6806406280093882b5cb049c.url}}",
      "{{206386ad6806406280093882b5cb049c.layer1.url}}"
    ];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const newUrl = newUrls[i];
      const actual = replaceUrl(url, url, newUrl, true);
      expect(actual).toEqual(newUrl);
    }
  });
});

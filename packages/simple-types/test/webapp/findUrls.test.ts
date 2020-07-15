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
import { findUrls } from "../../src/webapp/findUrls";

let MOCK_USER_SESSION: common.UserSession;

describe("webapp :: findUrls :: ", () => {
  it("handles unsupported services and services already in list of result URLs ", () => {
    const testString: string =
      '{"someProperty":{"url1":"https://fake.com/arcgis/rest/services/test/OtherServer/1",' +
      '"url2":"https://fake.com/arcgis/rest/services/test/FeatureServer/1"}}';
    const portalUrl: string = "";
    const requestUrls: string[] = [
      "https://fake.com/arcgis/rest/services/test/FeatureServer/1"
    ];
    const serviceRequests: any[] = [];

    const result = findUrls(
      testString,
      portalUrl,
      requestUrls,
      serviceRequests,
      MOCK_USER_SESSION
    );
    const expectedResult = {
      testString:
        '{"someProperty":{"url1":"https://fake.com/arcgis/rest/services/test/OtherServer/1",' +
        '"url2":"https://fake.com/arcgis/rest/services/test/FeatureServer/1"}}',
      requestUrls: [
        "https://fake.com/arcgis/rest/services/test/FeatureServer/1"
      ],
      serviceRequests: [] as any[]
    };

    expect(result).toEqual(expectedResult);
  });
});

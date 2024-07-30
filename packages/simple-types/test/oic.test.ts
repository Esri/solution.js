/** @license
 * Copyright 2018 Esri
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
 * Provides tests for functions involving the creation and deployment of OIC (Oriented Imagery Catalog) item types.
 */

import * as common from "@esri/solution-common";
import * as fetchMock from "fetch-mock";
import * as mockItems from "../../common/test/mocks/agolItems";
import * as oic from "../src/oic";
import * as templates from "../../common/test/mocks/templates";
import * as utils from "../../common/test/mocks/utils";

// ------------------------------------------------------------------------------------------------------------------ //

describe("Module `webmap`: manages the creation and deployment of OIC (Oriented Imagery Catalog) item types", () => {
  let MOCK_USER_SESSION: common.UserSession;

  beforeEach(() => {
    MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
  });

  afterEach(() => {
    fetchMock.restore();
  });

  describe("convertItemToTemplate", () => {
    it("handles failure to get layer information", async () => {
      const itemTemplate = templates.getItemTemplate("Oriented Imagery Catalog");
      itemTemplate.data.properties.ServiceURL =
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1";
      itemTemplate.data.properties.OverviewURL =
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2";

      fetchMock
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1",
          mockItems.get400Failure(),
        )
        .post("http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2", {
          serviceItemId: "svc1234567890b",
          id: 2,
        });

      return oic.convertItemToTemplate(itemTemplate, MOCK_USER_SESSION, MOCK_USER_SESSION).then(
        () => fail(),
        () => Promise.resolve(),
      );
    });

    it("handles missing data section", async () => {
      const itemTemplate = templates.getItemTemplate("Oriented Imagery Catalog");
      itemTemplate.data = null;

      const expected = templates.getItemTemplate("Oriented Imagery Catalog");
      expected.data = null;

      const actual = await oic.convertItemToTemplate(itemTemplate, MOCK_USER_SESSION, MOCK_USER_SESSION);
      expect(actual).toEqual(expected);
    });
  });

  describe("_extractDependencies", () => {
    it("handles missing data or properties", async () => {
      const expectedDependencies = {
        dependencies: [] as string[],
        urlHash: {} as any,
      };
      let actual = await oic._extractDependencies(templates.getItemTemplateSkeleton(), null as any);
      expect(actual).toEqual(expectedDependencies);

      const itemTemplate: common.IItemTemplate = templates.getItemTemplate("Oriented Imagery Catalog");
      itemTemplate.data.properties = null;
      actual = await oic._extractDependencies(itemTemplate, null as any);
      expect(actual).toEqual(expectedDependencies);

      itemTemplate.data = null;
      actual = await oic._extractDependencies(itemTemplate, null as any);
      expect(actual).toEqual(expectedDependencies);
    });

    it("handles both of the URL properties", async () => {
      const itemTemplate = templates.getItemTemplate("Oriented Imagery Catalog");
      itemTemplate.data.properties.ServiceURL =
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1";
      itemTemplate.data.properties.OverviewURL =
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2";

      fetchMock
        .post("http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1", {
          serviceItemId: "svc1234567890a",
          id: 1,
        })
        .post("http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2", {
          serviceItemId: "svc1234567890b",
          id: 2,
        });

      const expected = {
        dependencies: ["svc1234567890a", "svc1234567890b"],
        urlHash: {
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1": "svc1234567890a",
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2": "svc1234567890b",
        },
      };

      const actual = await oic._extractDependencies(itemTemplate, MOCK_USER_SESSION);
      expect(actual).toEqual(expected);
    });

    it("handles failure to get layer information", async () => {
      const itemTemplate = templates.getItemTemplate("Oriented Imagery Catalog");
      itemTemplate.data.properties.ServiceURL =
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1";
      itemTemplate.data.properties.OverviewURL =
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2";

      fetchMock
        .post(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1",
          mockItems.get400Failure(),
        )
        .post("http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2", {
          serviceItemId: "svc1234567890b",
          id: 2,
        });

      return oic._extractDependencies(itemTemplate, MOCK_USER_SESSION).then(
        () => fail(),
        () => Promise.resolve(),
      );
    });
  });

  describe("_getLayerIds", () => {
    it("handles empty layer URL list", async () => {
      const layerURLs: string[] = [];
      const dependencies: string[] = [];

      fetchMock
        .post("http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1", {
          serviceItemId: "svc1234567890a",
          id: 1,
        })
        .post("http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2", {
          serviceItemId: "svc1234567890b",
          id: 2,
        });

      const expected = {
        dependencies: [] as string[],
        urlHash: {} as any,
      };

      const actual = await oic._getLayerIds(layerURLs, dependencies, MOCK_USER_SESSION);
      expect(actual).toEqual(expected);
    });

    it("handles single layer URL", async () => {
      const layerURLs: string[] = ["http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1"];
      const dependencies: string[] = [];

      fetchMock.post("http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1", {
        serviceItemId: "svc1234567890a",
        id: 1,
      });

      const expected = {
        dependencies: ["svc1234567890a"],
        urlHash: {
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1": "svc1234567890a",
        },
      };

      const actual = await oic._getLayerIds(layerURLs, dependencies, MOCK_USER_SESSION);
      expect(actual).toEqual(expected);
    });

    it("handles duplicate, empty, MapServer layer URLs", async () => {
      const layerURLs: string[] = [
        "",
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2",
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1",
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/MapServer",
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2",
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1",
      ];
      const dependencies: string[] = [];

      fetchMock
        .post("http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1", {
          serviceItemId: "svc1234567890a",
          id: 1,
        })
        .post("http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2", {
          serviceItemId: "svc1234567890b",
          id: 2,
        });

      const expected = {
        dependencies: ["svc1234567890b", "svc1234567890a"],
        urlHash: {
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2": "svc1234567890b",
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1": "svc1234567890a",
        },
      };

      const actual = await oic._getLayerIds(layerURLs, dependencies, MOCK_USER_SESSION);
      expect(actual).toEqual(expected);
    });

    it("handles failure to get layer information", async () => {
      const layerURLs: string[] = ["http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1"];
      const dependencies: string[] = [];

      fetchMock.post(
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1",
        mockItems.get400Failure(),
      );

      return oic._getLayerIds(layerURLs, dependencies, MOCK_USER_SESSION).then(
        () => fail(),
        () => Promise.resolve(),
      );
    });
  });

  describe("_templatizeOicLayerUrl", () => {
    it("handles omitted URL", () => {
      expect(oic._templatizeOicLayerUrl(null as any, null as any)).toBeNull();
      expect(oic._templatizeOicLayerUrl("", null)).toEqual("");
    });

    it("only templatizes URLs in hash", () => {
      const urlHash = {
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1": "svc1234567890a",
        "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService2/FeatureServer/2": "svc1234567890b",
      };
      expect(
        oic._templatizeOicLayerUrl(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService0/FeatureServer/0",
          urlHash,
        ),
      ).toEqual("http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService0/FeatureServer/0");
      expect(
        oic._templatizeOicLayerUrl(
          "http://services.arcgis.com/myOrg/ArcGIS/rest/services/myService1/FeatureServer/1",
          urlHash,
        ),
      ).toEqual("{{svc1234567890a.layer1.url}}");
    });

    it("will add portalBaseUrl var and templatize the itemId in service url", () => {
      expect(
        oic._templatizeOicLayerUrl(
          "https://www.arcgis.com/home/item.html?id=aaa7c44e3f504a20a4c9f37b6c91e213&sublayer=0",
          {},
        ),
      ).toEqual("{{portalBaseUrl}}/home/item.html?id={{aaa7c44e3f504a20a4c9f37b6c91e213.itemId}}&sublayer=0");
    });
  });
});

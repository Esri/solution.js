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

import * as generalHelpers from "../../src/generalHelpers";
import * as interfaces from "../../src/interfaces";

// -------------------------------------------------------------------------------------------------------------------//

export const ORG_URL = "https://myorg.maps.arcgis.com";
export const PORTAL_URL = "https://myorg.maps.arcgis.com";

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
  success: false,
};

export const ArcgisRestSuccessFailStruct = {
  success: false,
  error: {
    success: false,
  },
};

export const SERVER_INFO = {
  currentVersion: 10.71,
  fullVersion: "10.7.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: PORTAL_URL,
  authInfo: {},
};

export const UTILITY_SERVER_INFO = {
  currentVersion: 10.71,
  fullVersion: "10.7.1",
  soapUrl: "https://utility.arcgisonline.com/arcgis/services",
  secureSoapUrl: "https://utility.arcgisonline.com/arcgis/services",
  authInfo: {
    isTokenBasedSecurity: true,
    tokenServicesUrl: "https://utility.arcgisonline.com/arcgis/tokens/",
    shortLivedTokenValidity: 60,
  },
};

export const PORTAL_SUBSET = {
  name: "Deployment Test",
  id: "abCDefG123456",
  restUrl: PORTAL_URL + "/sharing/rest",
  portalUrl: PORTAL_URL,
  urlKey: "deploymentTest",
};

export const ITEM_PROGRESS_CALLBACK: interfaces.IItemProgressCallback = function(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  itemId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  status: interfaces.EItemProgressStatus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  costUsed: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createdItemId: string | undefined, // supplied when status is EItemProgressStatus.Created or .Finished
): boolean {
  return true;
};

export const SOLUTION_PROGRESS_CALLBACK: interfaces.ISolutionProgressCallback = function(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  percentDone: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  jobId: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  progressEvent: interfaces.ISolutionProgressEvent | undefined,
): void {};

/**
 * Provides a successful progress callback until the nth call.
 *
 * @param callToFailOn 1-based call to fail on; before this call, function returns true
 * @return Callback function that tracks calls and fails when specified
 */
export function createFailingItemProgressCallbackOnNthCall(callToFailOn: number): interfaces.IItemProgressCallback {
  let numCalls = 0;
  return function() {
    return callToFailOn !== ++numCalls;
  };
}

export function getSampleGroupToAdd(title: string): interfaces.IGroupAdd {
  return {
    title: title,
    access: "private",
    owner: "casey",
    tags: ["test"],
    description: "",
    thumbnail: undefined,
    snippet: "",
  };
}

export function getSampleMetadataAsBlob(mimeType = "text/xml"): Blob {
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><metadata xml:lang="en">
      <dataIdInfo>
        <idCitation>
          <resTitle>Map with metadata</resTitle>
        </idCitation>
        <dataChar>
          <CharSetCd value="004"/>
        </dataChar>
        <searchKeys>
        <keyword>test</keyword></searchKeys>
      </dataIdInfo>
      <Esri>
        <ArcGISstyle>ISO 19139 Metadata Implementation Specification GML3.2</ArcGISstyle>
        <CreaDate>2019-06-17</CreaDate>
        <CreaTime>15:06:36.83</CreaTime>
        <ModDate>2019-09-16</ModDate>
        <ModTime>12:41:35.43</ModTime>
        <ArcGISFormat>1.0</ArcGISFormat>
        <ArcGISProfile>ISO19139</ArcGISProfile>
        <PublishStatus>editor:esri.dijit.metadata.editor</PublishStatus>
      </Esri>
      <mdDateSt>2019-06-17</mdDateSt>
      <mdFileID>c67325516f3c47198727263bb6e299f1</mdFileID>
      <mdChar>
        <CharSetCd value="004"/>
      </mdChar>
      <mdContact>
        <role>
          <RoleCd value="007"/>
        </role>
      </mdContact>
    </metadata>`;
  return xmlToBlob(xml, mimeType);
}

export function getSampleMetadataAsFile(filename = "metadata.xml", mimeType = "text/xml"): File {
  return new File([getSampleMetadataAsBlob(mimeType)], filename, {
    type: mimeType,
  });
}

export function jsonToBlob(json: any): Blob {
  return new Blob([JSON.stringify(json)], { type: "application/json" });
}

export function xmlToBlob(xml: any, mimeType = "text/xml"): Blob {
  return new Blob([xml], { type: mimeType });
}

export function getSampleImageAsBlob(): Blob {
  // Decode base-64 to binary, then binary to character codes as Uint8
  return _imageDataToBlob(_binaryToUint8CharCodes(atob(_imageAsDataUri(false))));
}

export function getSampleImageAsFile(filename = "sampleImage"): File {
  return generalHelpers.blobToFile(getSampleImageAsBlob(), filename);
}

function _binaryToUint8CharCodes(binaryData: string): Uint8Array {
  const array16: number[] = [];
  for (let i = 0; i < binaryData.length; i++) {
    array16.push(binaryData.charCodeAt(i));
  }
  return new Uint8Array(array16);
}

export function getSampleJson(): any {
  return {
    a: "a",
    b: 1,
    c: {
      d: "d",
    },
  };
}

export function getSampleJsonAsBlob(): Blob {
  return jsonToBlob(getSampleJson());
}

export function getSampleJsonAsFile(filename: string, mimeType = "application/json"): File {
  return new File([getSampleJsonAsBlob()], filename, {
    type: mimeType,
  });
}

export function getSampleQCJsonData(): any {
  return {
    application: {
      basemap: {
        type: "Web Map",
        itemId: "map1234567890",
        mapAreas: [],
        required: true,
        useDefaultBasemap: false,
        zoomLevel: null,
      },
    },
    name: "qc.project.json",
  };
}

export function getSampleQCProjectJsonFile(): File {
  return new File(
    [
      jsonToBlob({
        basemap: {
          type: "Web Map",
          itemId: "map1234567890",
          mapAreas: [],
          required: true,
          useDefaultBasemap: false,
          zoomLevel: null,
        },
      }),
    ],
    "qc.project.json",
    {
      type: "application/json",
    },
  );
}

export function getSampleTextAsBlob(mimeType = "text/plain"): Blob {
  return new Blob(["this is some text"], { type: mimeType });
}

export function getSampleTextAsFile(filename: string, mimeType = "text/plain"): File {
  return new File([getSampleTextAsBlob(mimeType)], filename, {
    type: mimeType,
  });
}

export function getSampleZip(mimeType = "application/zip"): Blob {
  const zipContents =
    "504B0304 0A000000 0000C045 D9424437\
EB352600 00002600 00000700 00006373\
762E6373 76746869 732C6973 2C612C63\
6F6D6D61 2C736570 61726174 65642C76\
616C7565 2C66696C 650D0A50 4B010214\
000A0000 000000C0 45D94244 37EB3526\
00000026 00000007000000000 00000000\
00200000 00000000 00637376 2E637376\
504B0506 00000000 01000100 35000000\
4B000000 0000";
  const bytes = new Uint8Array(Math.ceil(zipContents.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(zipContents.substr(i * 2, 2), 16);
  }
  return new Blob([bytes], { type: mimeType });
}

export function getSampleZipFile(name: string): File {
  return new File([getSampleZip()], name, {
    type: "application/zip",
  });
}

function _imageDataToBlob(data: Uint8Array): Blob {
  return new Blob([data], { type: "image/png" });
}

export function getTokenResponse(token: string = "fake-token") {
  return { token: token };
}

export function getTransformationsResponse(hasTransformation: boolean = false) {
  return hasTransformation ? '{"transformations":[{wkid: 4326}]}' : '{"transformations":[]}';
}

export function getProjectResponse() {
  return {
    geometries: [
      {
        x: -88.226,
        y: 41.708,
      },
      {
        x: -88.009,
        y: 41.844,
      },
    ],
  };
}

export function getCreateFolderResponse(folderId: string = "a4468da125a64526b359b70d8ba4a9dd") {
  return getSuccessResponse({
    folder: {
      username: "casey",
      id: folderId,
      title: "Test Deployment",
    },
  });
}

export function getCreateGroupResponse(id: string = "ebb41907d02742f2aef72adb6d393019") {
  return getSuccessResponse({
    group: {
      id: id,
      title: "Group Name",
      isInvitationOnly: true,
      owner: "casey",
      description: "description",
      snippet: "snippet",
      tags: ["tag"],
      phone: null,
      sortField: "title",
      sortOrder: "asc",
      isViewOnly: true,
      thumbnail: null,
      created: 1582844507759,
      modified: 1582844507761,
      access: "private",
      capabilities: [],
      isFav: false,
      isReadOnly: false,
      protected: false,
      autoJoin: false,
      notificationsEnabled: false,
      provider: null,
      providerGroupName: null,
      leavingDisallowed: false,
      hiddenMembers: false,
      displaySettings: {
        itemTypes: "",
      },
    },
  });
}

export function getFailureResponse(args?: any) {
  const response = { success: false };
  return Object.assign(response, args || {});
}

export function getSuccessResponse(args?: any) {
  const response = { success: true };
  return Object.assign(response, args || {});
}

export function getShareResponse(id: string) {
  return {
    notSharedWith: [] as string[],
    itemId: id,
  };
}

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

export function createMockSettings(solutionName = "", folderId = "", access = "private"): any {
  const settings: any = {
    organization: getPortalsSelfResponse(),
    portalBaseUrl: ORG_URL,
    solutionName,
    folderId,
    access,
  };

  return settings;
}

export function createRuntimeMockUserSession(
  now?: number,
  portalUrl?: string,
  isEnterprise = false,
): interfaces.UserSession {
  if (now === undefined) {
    now = Date.now();
  }
  const tomorrow = new Date(now + 86400000);
  const userSession = new interfaces.UserSession({
    clientId: "clientId",
    redirectUri: "https://example-app.com/redirect-uri",
    token: "fake-token",
    tokenExpires: tomorrow,
    refreshToken: "refreshToken",
    refreshTokenExpires: tomorrow,
    refreshTokenTTL: 1440,
    username: "casey",
    password: "123456",
    portal: (portalUrl || PORTAL_URL) + "/sharing/rest",
  });

  (userSession as any).isEnterprise = isEnterprise;

  userSession.getPortal = function() {
    return (this as any).isEnterprise
      ? Promise.resolve({ portalHostname: "myOrg.ags.esri.com/portal" })
      : Promise.resolve({ urlKey: "myUrlKey" });
  };

  return userSession;
}

export function jsonClone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Removes item-specific functions from templates.
 *
 * @param solutionTemplateItem Solution template
 */
export function removeItemFcns(solutionTemplateItem: interfaces.ISolutionItem): void {
  const templates = generalHelpers.getProp(solutionTemplateItem, "data.templates");
  if (templates) {
    if (Array.isArray(templates)) {
      templates.forEach((template) => {
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

export function getPortalsSelfResponse() {
  // https://developers.arcgis.com/rest/users-groups-and-items/portal-self.htm
  return {
    access: "public",
    allSSL: true,
    allowedRedirectUris: [] as string[],
    analysisLayersGroupQuery: 'title:"Living Atlas Analysis Layers" AND owner:esri',
    authorizedCrossOriginDomains: ["https://ec2-18-219-57-96.us-east-2.compute.amazonaws.com"],
    backgroundImage: "images/arcgis_background.jpg",
    basemapGalleryGroupQuery: 'title:"United States Basemaps" AND owner:Esri_cy_US',
    bingKey: "AmMpS0SyUPJSy2uXeMLn5aAEdhqKNSwWyBLsKEqF4Sb_knUpLbvjny8z1b2SoxXz",
    colorSetsGroupQuery: 'title:"Esri Colors" AND owner:esri_en',
    commentsEnabled: false,
    contentCategorySetsGroupQuery: 'title:"ArcGIS Online Content Category Sets" AND owner:esri_en',
    culture: "en",
    cultureFormat: "us",
    customBaseUrl: "maps.arcgis.com",
    defaultBasemap: {
      baseMapLayers: [
        {
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
          layerType: "ArcGISTiledMapServiceLayer",
          resourceInfo: {
            currentVersion: 10.3,
            mapName: "Layers",
            supportsDynamicLayers: false,
            layers: [
              {
                id: 0,
                name: "Citations",
                parentLayerId: -1,
                defaultVisibility: false,
                subLayerIds: "",
                minScale: 0,
                maxScale: 0,
              },
            ],
            tables: [] as any[],
            spatialReference: {
              wkid: 102100,
              latestWkid: 3857,
            },
            singleFusedMapCache: true,
            tileInfo: {
              rows: 256,
              cols: 256,
              dpi: 96,
              format: "JPEG",
              compressionQuality: 90,
              origin: {
                x: -20037508.342787,
                y: 20037508.342787,
              },
              spatialReference: {
                wkid: 102100,
                latestWkid: 3857,
              },
              lods: [
                {
                  level: 0,
                  resolution: 156543.03392800014,
                  scale: 591657527.591555,
                },
                {
                  level: 1,
                  resolution: 78271.51696399994,
                  scale: 295828763.795777,
                },
                {
                  level: 2,
                  resolution: 39135.75848200009,
                  scale: 147914381.897889,
                },
                {
                  level: 3,
                  resolution: 19567.87924099992,
                  scale: 73957190.948944,
                },
                {
                  level: 4,
                  resolution: 9783.93962049996,
                  scale: 36978595.474472,
                },
                {
                  level: 5,
                  resolution: 4891.96981024998,
                  scale: 18489297.737236,
                },
                {
                  level: 6,
                  resolution: 2445.98490512499,
                  scale: 9244648.868618,
                },
                {
                  level: 7,
                  resolution: 1222.992452562495,
                  scale: 4622324.434309,
                },
                {
                  level: 8,
                  resolution: 611.4962262813797,
                  scale: 2311162.217155,
                },
                {
                  level: 9,
                  resolution: 305.74811314055756,
                  scale: 1155581.108577,
                },
                {
                  level: 10,
                  resolution: 152.87405657041106,
                  scale: 577790.554289,
                },
                {
                  level: 11,
                  resolution: 76.43702828507324,
                  scale: 288895.277144,
                },
                {
                  level: 12,
                  resolution: 38.21851414253662,
                  scale: 144447.638572,
                },
                {
                  level: 13,
                  resolution: 19.10925707126831,
                  scale: 72223.819286,
                },
                {
                  level: 14,
                  resolution: 9.554628535634155,
                  scale: 36111.909643,
                },
                {
                  level: 15,
                  resolution: 4.77731426794937,
                  scale: 18055.954822,
                },
                {
                  level: 16,
                  resolution: 2.388657133974685,
                  scale: 9027.977411,
                },
                {
                  level: 17,
                  resolution: 1.1943285668550503,
                  scale: 4513.988705,
                },
                {
                  level: 18,
                  resolution: 0.5971642835598172,
                  scale: 2256.994353,
                },
                {
                  level: 19,
                  resolution: 0.29858214164761665,
                  scale: 1128.497176,
                },
                {
                  level: 20,
                  resolution: 0.14929107082380833,
                  scale: 564.248588,
                },
                {
                  level: 21,
                  resolution: 0.07464553541190416,
                  scale: 282.124294,
                },
                {
                  level: 22,
                  resolution: 0.03732276770595208,
                  scale: 141.062147,
                },
                {
                  level: 23,
                  resolution: 0.01866138385297604,
                  scale: 70.5310735,
                },
              ],
            },
            initialExtent: {
              xmin: -28848255.049479112,
              ymin: -2077452.082122866,
              xmax: 28848255.049479112,
              ymax: 16430757.376790084,
              spatialReference: {
                wkid: 102100,
                latestWkid: 3857,
              },
            },
            fullExtent: {
              xmin: -20037507.067161843,
              ymin: -19971868.880408604,
              xmax: 20037507.067161843,
              ymax: 19971868.88040863,
              spatialReference: {
                wkid: 102100,
                latestWkid: 3857,
              },
            },
            minScale: 591657527.591555,
            maxScale: 70.5310735,
            units: "esriMeters",
            supportedImageFormatTypes: "PNG32,PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,BMP",
            capabilities: "Map,Tilemap,Query,Data",
            supportedQueryFormats: "JSON, AMF",
            exportTilesAllowed: false,
            maxRecordCount: 100,
            maxImageHeight: 4096,
            maxImageWidth: 4096,
            supportedExtensions: "KmlServer",
          },
        },
      ],
      title: "Topographic",
    },
    defaultExtent: {
      xmin: -9821384.714217981,
      ymin: 5117339.123090005,
      xmax: -9797228.384715842,
      ymax: 5137789.39951188,
      spatialReference: {
        wkid: 102100,
      },
    },
    defaultVectorBasemap: {
      baseMapLayers: [
        {
          id: "World_Hillshade_3805",
          layerType: "ArcGISTiledMapServiceLayer",
          url: "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
          visibility: true,
          opacity: 1,
          title: "World Hillshade",
        },
        {
          id: "VectorTile_2333",
          type: "VectorTileLayer",
          layerType: "VectorTileLayer",
          title: "World Topographic Map",
          styleUrl: "https://cdn.arcgis.com/sharing/rest/content/items/vts1234567890/resources/styles/root.json",
          visibility: true,
          opacity: 1,
        },
      ],
      title: "Topographic",
    },
    description: "<br>",
    eueiEnabled: false,
    featuredGroups: [
      {
        title: "Community Basemaps",
        owner: "esri",
      },
      {
        title: "ArcGIS for Local Government",
        owner: "ArcGISTeamLocalGov",
      },
      {
        title: "ArcGIS for Local Government Try It Live Services",
        owner: "lind5149_lg",
        id: "72b563693f6f402c9bcfb94d1be38916",
      },
      {
        title: "Vector Basemap",
        owner: "chri4849_lg",
        id: "09a0c2935b6841f381db54e0566a2aaa",
      },
    ],
    featuredGroupsId: "",
    featuredItemsGroupQuery: "",
    galleryTemplatesGroupQuery: 'title:"Gallery Templates" AND owner:esri_en',
    hasCategorySchema: true,
    helpBase: "https://doc.arcgis.com/en/arcgis-online/",
    helperServices: {
      asyncClosestFacility: {
        url: "https://logistics.arcgis.com/arcgis/rest/services/World/ClosestFacility/GPServer/FindClosestFacilities",
        defaultTravelMode: "FEgifRtFndKNcJMJ",
      },
      asyncLocationAllocation: {
        url: "https://logistics.arcgis.com/arcgis/rest/services/World/LocationAllocation/GPServer",
        defaultTravelMode: "FEgifRtFndKNcJMJ",
      },
      asyncODCostMatrix: {
        url: "https://logistics.arcgis.com/arcgis/rest/services/World/OriginDestinationCostMatrix/GPServer",
        defaultTravelMode: "FEgifRtFndKNcJMJ",
      },
      asyncRoute: {
        url: "https://logistics.arcgis.com/arcgis/rest/services/World/Route/GPServer",
        defaultTravelMode: "FEgifRtFndKNcJMJ",
      },
      asyncServiceArea: {
        url: "https://logistics.arcgis.com/arcgis/rest/services/World/ServiceAreas/GPServer/GenerateServiceAreas",
        defaultTravelMode: "FEgifRtFndKNcJMJ",
      },
      asyncVRP: {
        url: "https://logistics.arcgis.com/arcgis/rest/services/World/VehicleRoutingProblem/GPServer/SolveVehicleRoutingProblem",
        defaultTravelMode: "FEgifRtFndKNcJMJ",
      },
      closestFacility: {
        url: "https://route.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World",
        defaultTravelMode: "FEgifRtFndKNcJMJ",
      },
      defaultElevationLayers: [
        {
          url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
          id: "globalElevation",
          layerType: "ArcGISTiledElevationServiceLayer",
        },
      ],
      elevation: {
        url: "https://elevation.arcgis.com/arcgis/rest/services/Tools/Elevation/GPServer",
      },
      elevationSync: {
        url: "https://elevation.arcgis.com/arcgis/rest/services/Tools/ElevationSync/GPServer",
      },
      geocode: [
        {
          url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
          northLat: "Ymax",
          southLat: "Ymin",
          eastLon: "Xmax",
          westLon: "Xmin",
          name: "ArcGIS World Geocoding Service",
          zoomScale: 10000,
          suggest: true,
          placefinding: true,
          batch: true,
        },
      ],
      geometry: {
        url: "https://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer",
      },
      hydrology: {
        url: "https://hydro.arcgis.com/arcgis/rest/services/Tools/Hydrology/GPServer",
      },
      orthomappingElevation: {
        url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
      },
      packaging: {
        url: "https://packaging.arcgis.com/arcgis/rest/services/OfflinePackaging/GPServer",
      },
      printTask: {
        url: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
      },
      route: {
        url: "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World",
        defaultTravelMode: "FEgifRtFndKNcJMJ",
      },
      routingUtilities: {
        url: "https://logistics.arcgis.com/arcgis/rest/services/World/Utilities/GPServer",
      },
      serviceArea: {
        url: "https://route.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World",
        defaultTravelMode: "FEgifRtFndKNcJMJ",
      },
      syncVRP: {
        url: "https://logistics.arcgis.com/arcgis/rest/services/World/VehicleRoutingProblemSync/GPServer/EditVehicleRoutingProblem",
        defaultTravelMode: "FEgifRtFndKNcJMJ",
      },
      traffic: {
        url: "https://traffic.arcgis.com/arcgis/rest/services/World/Traffic/MapServer",
      },
      trafficData: {
        url: "https://traffic.arcgis.com/arcgis/rest/services/World/TrafficFeeds/GPServer",
      },
      analysis: {
        url: "https://analysis.arcgis.com/arcgis/rest/services/tasks/GPServer",
      },
      geoenrichment: {
        url: "https://geoenrich.arcgis.com/arcgis/rest/services/World/GeoenrichmentServer",
      },
      asyncGeocode: {
        url: "https://analysis.arcgis.com/arcgis/rest/services/tasks/GPServer",
      },
      creditEstimation: {
        url: "https://analysis.arcgis.com/arcgis/rest/services/Estimate/GPServer",
      },
    },
    homePageFeaturedContent: "id:f292c6105dc243a2ad1377245722e312",
    homePageFeaturedContentCount: 12,
    id: "org1234567890",
    isPortal: false,
    layerTemplatesGroupQuery: 'title:"Esri Layer Templates" AND owner:esri_en',
    livingAtlasGroupQuery: 'title:"LAW Search" AND owner:Esri_LivingAtlas',
    metadataEditable: true,
    metadataFormats: ["iso19139"],
    name: "ArcGIS Team Local Gov",
    portalHostname: "www.arcgis.com",
    portalMode: "multitenant",
    portalName: "ArcGIS Online",
    portalProperties: {
      openData: {
        enabled: true,
        settings: {
          groupId: "0472bb819e9741809373812a6400dade",
          migrations: {
            siteToItems: true,
          },
          appVersion: "2.1",
        },
      },
      sharedTheme: {
        logo: {
          small: "",
        },
        button: {
          background: "#ebebeb",
          text: "#1a1a1a",
        },
        body: {
          link: "#004da8",
          background: "#ebebeb",
          text: "#474747",
        },
        header: {
          background: "#999999",
          text: "#242424",
        },
      },
      links: {
        contactUs: {
          url: "mailto:arcgisteamlocalgov@esri.com",
          visible: false,
        },
      },
      showSocialMediaLinks: true,
      hub: {
        enabled: true,
        settings: {
          orgType: "enterprise",
          communityOrg: {
            orgId: "hcOb9dpllCwWSJAh",
            portalHostname: "gov-solutions.maps.arcgis.com",
          },
        },
      },
      revertStdSqlEndDate: 1554993043785,
      revertHttpsEndDate: 1558907781119,
    },
    portalThumbnail: "",
    rasterFunctionTemplatesGroupQuery: 'title:"Raster Function Templates" AND owner:esri_en',
    region: "WO",
    rotatorPanels: [
      {
        id: "banner-3",
        innerHTML:
          "<img src='images/banner-3.jpg' style='-webkit-border-radius:0 0 10px 10px; -moz-border-radius:0 0 10px 10px; -o-border-radius:0 0 10px 10px; border-radius:0 0 10px 10px; margin-top:0; width:960px; height:180px;'/><div style='position:absolute; bottom:80px; left:80px; max-height:65px; width:660px; margin:0;'><span style='position:absolute; bottom:0; margin-bottom:0; line-height:normal; font-family:HelveticaNeue,Verdana; font-weight:600; font-size:32px; color:#fff;'>ArcGIS Team Local Gov</span></div>",
      },
    ],
    showHomePageDescription: true,
    staticImagesUrl: "https://static.arcgis.com/images",
    stylesGroupQuery: 'title:"Esri Styles" AND owner:esri_en',
    supportsHostedServices: true,
    symbolSetsGroupQuery: 'title:"Esri Symbols" AND owner:esri_en',
    templatesGroupQuery: 'title:"Web Application Templates" AND owner:esri_en',
    thumbnail: "",
    units: "english",
    urlKey: "myorg",
    useVectorBasemaps: true,
    vectorBasemapGalleryGroupQuery: 'title:"United States Vector Basemaps" AND owner:Esri_cy_US',
    publicSubscriptionInfo: {
      companionOrganizations: [
        {
          type: "Community",
          organizationUrl: "gov-solutions.maps.arcgis.com",
        },
      ],
    },
    ipCntryCode: "US",
    httpPort: 80,
    httpsPort: 443,
    supportsOAuth: true,
    currentVersion: "7.2",
    allowedOrigins: [] as any[],
  };
}

export function getUserResponse() {
  return {
    username: "LocalGovDeployCasey",
    id: "7f7dfdd4d9184e188eb44c2356ad74d9",
    fullName: "Casey Jones",
    firstName: "Casey",
    lastName: "Jones",
    preferredView: "GIS",
    description: null as any,
    email: "casey@esri.com",
    userType: "arcgisonly",
    idpUsername: null as any,
    favGroupId: "318a6b072baa453bba5383cd103d8628",
    lastLogin: 1573839621000,
    mfaEnabled: false,
    access: "org",
    storageUsage: 2069559555,
    storageQuota: 2199023255552,
    orgId: "org1234567890",
    role: "org_admin",
    privileges: [
      "features:user:edit",
      "features:user:fullEdit",
      "marketplace:admin:manage",
      "marketplace:admin:purchase",
      "marketplace:admin:startTrial",
      "opendata:user:designateGroup",
      "opendata:user:openDataAdmin",
      "portal:admin:assignToGroups",
      "portal:admin:categorizeItems",
      "portal:admin:changeUserRoles",
      "portal:admin:createUpdateCapableGroup",
      "portal:admin:deleteEmptyGroups",
      "portal:admin:deleteItems",
      "portal:admin:deleteUsers",
      "portal:admin:disableUsers",
      "portal:admin:inviteUsers",
      "portal:admin:manageCollaborations",
      "portal:admin:manageCredits",
      "portal:admin:manageEnterpriseGroups",
      "portal:admin:manageLicenses",
      "portal:admin:manageRoles",
      "portal:admin:manageSecurity",
      "portal:admin:manageServers",
      "portal:admin:manageUtilityServices",
      "portal:admin:manageWebsite",
      "portal:admin:reassignGroups",
      "portal:admin:reassignItems",
      "portal:admin:reassignUsers",
      "portal:admin:shareToGroup",
      "portal:admin:shareToOrg",
      "portal:admin:shareToPublic",
      "portal:admin:updateGroups",
      "portal:admin:updateItemCategorySchema",
      "portal:admin:updateItems",
      "portal:admin:updateUsers",
      "portal:admin:viewGroups",
      "portal:admin:viewItems",
      "portal:admin:viewUsers",
      "portal:publisher:bulkPublishFromDataStores",
      "portal:publisher:publishFeatures",
      "portal:publisher:publishScenes",
      "portal:publisher:publishServerGPServices",
      "portal:publisher:publishServerServices",
      "portal:publisher:publishTiles",
      "portal:publisher:registerDataStores",
      "portal:user:categorizeItems",
      "portal:user:createGroup",
      "portal:user:createItem",
      "portal:user:joinGroup",
      "portal:user:joinNonOrgGroup",
      "portal:user:shareGroupToOrg",
      "portal:user:shareGroupToPublic",
      "portal:user:shareToGroup",
      "portal:user:shareToOrg",
      "portal:user:shareToPublic",
      "portal:user:viewOrgGroups",
      "portal:user:viewOrgItems",
      "portal:user:viewOrgUsers",
      "portal:user:viewTracks",
      "premium:publisher:createAdvancedNotebooks",
      "premium:publisher:createNotebooks",
      "premium:publisher:geoanalytics",
      "premium:publisher:rasteranalysis",
      "premium:user:demographics",
      "premium:user:elevation",
      "premium:user:featurereport",
      "premium:user:geocode",
      "premium:user:geoenrichment",
      "premium:user:networkanalysis",
      "premium:user:spatialanalysis",
    ],
    level: "2",
    userLicenseTypeId: "creatorUT",
    disabled: false,
    tags: [] as string[],
    culture: "en-US",
    cultureFormat: "us",
    region: "US",
    units: "english",
    thumbnail: null as any,
    created: 1551469472000,
    modified: 1559775285000,
    provider: "arcgis",
    groups: [
      {
        id: "22547723baa14ba89ea3845f8b7b4e79",
        title: "Homeless Activity Manager_811d0bbc9a4942fe9f1375088c4ed099",
        isInvitationOnly: true,
        owner: "LocalGovDeployCasey",
        description:
          "This group is required to configure the Crowdsource Manager application and used to share maps with health and human service personnel to manage reports of homeless individuals and encampments in the community.",
        snippet:
          "This group is required to configure the Crowdsource Manager application and used to share maps with health and human service personnel to manage reports of homeless individuals and encampments in the community.",
        tags: ["Homelessness", "Health and Human Services", "Public Safety", "Homeless Activity", "Encampments"],
        phone: null as any,
        sortField: "title",
        sortOrder: "asc",
        isViewOnly: true,
        thumbnail: null as any,
        created: 1573600936000,
        modified: 1573600937000,
        access: "private",
        capabilities: [] as string[],
        isFav: false,
        isReadOnly: false,
        protected: false,
        autoJoin: false,
        notificationsEnabled: false,
        provider: null as any,
        providerGroupName: null as any,
        leavingDisallowed: false,
        hiddenMembers: false,
        displaySettings: {
          itemTypes: "",
        },
        userMembership: {
          username: "casey",
          memberType: "owner",
          applications: 0,
        },
      },
    ],
  };
}

export function getContentUser() {
  return {
    username: "LocalGovDeployCasey",
    total: 17,
    start: 1,
    num: 17,
    nextStart: -1,
    currentFolder: null as any,
    items: [
      {
        id: "cd502cb019cb4c8cb7be297eab5ea47c",
        owner: "LocalGovDeployCasey",
        created: 1564508371000,
        isOrgItem: true,
        modified: 1564508374000,
        guid: null as any,
        name: null as any,
        title: "Test",
        type: "Application",
        typeKeywords: ["Application", "Registered App"],
        description: null as any,
        tags: ["test"],
        snippet: null as any,
        thumbnail: "thumbnail/ago_downloaded.png",
        documentation: null as any,
        extent: [] as any[],
        categories: [] as any[],
        spatialReference: null as any,
        accessInformation: null as any,
        licenseInfo: null as any,
        culture: "en-us",
        properties: null as any,
        url: null as any,
        proxyFilter: null as any,
        access: "private",
        size: 0,
        appCategories: [] as any[],
        industries: [] as any[],
        languages: [] as any[],
        largeThumbnail: null as any,
        banner: null as any,
        screenshots: [] as any[],
        listed: false,
        ownerFolder: null as any,
        protected: false,
        numComments: 0,
        numRatings: 0,
        avgRating: 0,
        numViews: 0,
        scoreCompleteness: 33,
        groupDesignations: null as any,
      },
    ],
    folders: [] as any[],
  };
}

export function getGroupResponse(query: string, hasResult: boolean) {
  return {
    query: query,
    total: 1,
    start: 1,
    num: 10,
    nextStart: -1,
    results: !hasResult
      ? []
      : [
          {
            id: "2146ddb18dbe4fe1bb11dc9594164549",
            title: query,
            isInvitationOnly: false,
            owner: "casey",
            description: "",
            snippet: "",
            tags: ["test"],
            phone: "123-456-7890",
            sortField: "title",
            sortOrder: "asc",
            isViewOnly: false,
            isFav: false,
            thumbnail: "test.jpg",
            created: 1258061693000,
            access: "public",
          },
        ],
  };
}

export function getSearchResponse<T extends interfaces.IItem | interfaces.IGroup | interfaces.IUser>(
  query: string,
  start: number,
  num: number,
  nextStart: number,
  total: number,
  numOfResults: number,
): interfaces.ISearchResult<T> {
  return {
    query,
    start,
    num,
    nextStart,
    total,
    results: Array(numOfResults).fill({ id: "1", title: "a" }) as T[],
  };
}

export function getCreateServiceResponse(
  url: string = "https://services123.arcgis.com/org1234567890/arcgis/rest/services/ROWPermits_publiccomment/FeatureServer",
  id: string = "svc1234567890",
  isView: boolean = false,
) {
  const name: string = url.replace(/.+services[/]/, "").replace("/FeatureServer", "");
  return getSuccessResponse({
    encodedServiceURL: url,
    itemId: id,
    name: name,
    serviceItemId: id,
    serviceurl: url,
    size: -1,
    type: "Feature Service",
    isView: isView,
  });
}

/**
 * Provides a supplied item with the nth call.
 *
 * @param trigger 1-based call count on which to start returning itemForNthCall; before this call,
 * function returns itemBeforeNthCall
 * @param itemForNthCall Item to return when trigger reached
 * @param itemBeforeNthCall Item to return before trigger reached
 * @return Function that tracks calls and provides items
 */
export function returnOnNthCall(
  trigger: number,
  itemForNthCall: any,
  itemBeforeNthCall: any,
): interfaces.INoArgFunction {
  let numCalls = 0;
  return function() {
    return ++numCalls < trigger ? itemBeforeNthCall : itemForNthCall;
  };
}

function _imageAsDataUri(withUri: boolean) {
  let uri = "";
  if (withUri) {
    uri = "data:image/png;charset=utf-8;base64,";
  }
  uri +=
    "\
iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAADKklEQVQ4T6XUf1DMeRzH8edu\
53ZVZ6vLxmo2Q0Y7rtJZJT8abQmdysjETVEWMxgGOzF2/IhkCqNT8qPyo8PE6fzIj/y4qYlU\
E6MfIottFcLmRyIq1Ne4neGa+ufG57/354/H+/3H6/0WCYIg8J1P1BNSkJ/PpXO5tLa187q5\
mTFqL6ZFzMRxgEuP7boh00JCcbB3IGZfFuM8f8PbfSD1IyIR3byI8uFVJoxRk5C4uQvWBfHx\
VHO44jKqcC0/BKgQ7tbzIS0LhvhDX3d400DkSAUFZ3MwPXyAVCr9F/uKhAaHkpqbQkhGEAa9\
EZeRcmpVOlCFQVwMbvqpLPA/QoruHnYSV+4V1tHS/vYbcqv6Fv4af6zVtsismnB0FmM9qQZB\
ZsuNljdMtttN+fIEtMcm0NgqJmtZGevnJmGqqCNxc6JlktjYWNKT9zIxU463jxKjIYmm65ex\
cfWi7Nga+nSWUV4k4DxchlQuobbCzJYjyRxYkEVVTZUFCZsShlTexnXvEXgN30RHzjZyk1cQ\
vjIV57FP6a/4B5NBoOxsI+rFbhhN7yjfaGC0Us3pvDMWJDI8gvczPTgVfwOeVhC8NJ7G0nME\
xf1JbWsREg5gZ99E9qxiNJl+PGn7xP3974myH8WGTXEWZFKAhqZ+7lzLTsX6xB1G/dSbj49f\
U5O9lbeD1Xy4dAGxqB7pCwMSNwc6nKywFfkSoXDmj107LUjE1BCkwToO7dEzPuoFbn5OFCWZ\
uX28FqavA1UgWDkhM6+gQ2agRTkam5SXaAa1czrvogUpLb5Kys59/BXox4+rtIhteuM51xUH\
p07Op6nhdz20ixHJVyMUXIEwHZq8Z8wJ+oWoGO23nPj+6kGgLo0E7Xysx5pxiffl1RMfzGsr\
Yag7PKgGaQnUP2f8koU4ltSRcz6va9i+VErHPizKNaDfmApt2yFwPuwogcZyWFsFvQpZKDFy\
91Qlh/4+ikKh6I58+fH2GIZXgIbS6mKq8+8jOfiIwXWFPDu5C130DNYtm8ejhoavQJfY/3ej\
blZWkpGegclk5FPzc2ztfqa1o5OoWdFEzo7utsk9noL/e14+AxP0YqryqgPxAAAAAElFTkSu\
QmCC";

  return uri;
}

export function loadSampleXLSX(
  filenameRoot: "09b843d27d8a441db4c88c1f03b8e9aa" | "c909d4ffd708476789e22664051629a0",
): File {
  switch (filenameRoot) {
    case "09b843d27d8a441db4c88c1f03b8e9aa":
      /*
      Two-row, one-column spreadsheet with the following content:
        09b843d27d8a441db4c88c1f03b8e9aa
        774ac2524dad4bf38c369ac1950d8d97
      */
      return new File(
        [
          _binaryToUint8CharCodes(
            atob(
              "UEsDBBQABgAIAAAAIQBi7p1oXgEAAJAEAAATAAgCW0NvbnRlbnRfVHlwZXNdLnhtbCCiBAIooAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACslMtOwzAQRfdI/EPkLUrcskAINe2CxxIqUT7AxJPGqmNbnmlp/56J+xBCoRVqN7ESz9x7MvHNaLJubbaCiMa7UgyLgcjAVV4bNy/Fx+wlvxcZknJaWe+gFBtAMRlfX41mmwCYcbfDUjRE4UFKrBpoFRY+gOOd2sdWEd/GuQyqWqg5yNvB4E5W3hE4yqnTEOPRE9RqaSl7XvPjLUkEiyJ73BZ2XqVQIVhTKWJSuXL6l0u+cyi4M9VgYwLeMIaQvQ7dzt8Gu743Hk00GrKpivSqWsaQayu/fFx8er8ojov0UPq6NhVoXy1bnkCBIYLS2ABQa4u0Fq0ybs99xD8Vo0zL8MIg3fsl4RMcxN8bZLqej5BkThgibSzgpceeRE85NyqCfqfIybg4wE/tYxx8bqbRB+QERfj/FPYR6brzwEIQycAhJH2H7eDI6Tt77NDlW4Pu8ZbpfzL+BgAA//8DAFBLAwQUAAYACAAAACEAtVUwI/QAAABMAgAACwAIAl9yZWxzLy5yZWxzIKIEAiigAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKySTU/DMAyG70j8h8j31d2QEEJLd0FIuyFUfoBJ3A+1jaMkG92/JxwQVBqDA0d/vX78ytvdPI3qyCH24jSsixIUOyO2d62Gl/pxdQcqJnKWRnGs4cQRdtX11faZR0p5KHa9jyqruKihS8nfI0bT8USxEM8uVxoJE6UchhY9mYFaxk1Z3mL4rgHVQlPtrYawtzeg6pPPm3/XlqbpDT+IOUzs0pkVyHNiZ9mufMhsIfX5GlVTaDlpsGKecjoieV9kbMDzRJu/E/18LU6cyFIiNBL4Ms9HxyWg9X9atDTxy515xDcJw6vI8MmCix+o3gEAAP//AwBQSwMEFAAGAAgAAAAhABsvpn2YAwAA6ggAAA8AAAB4bC93b3JrYm9vay54bWysVW1vozgQ/n7S/QfEd4rNWwA1XUEAXaV2VaXZ9k6KVLngBC6AOds0qar97zcmIW23p1Oue1Fix57h8TMzz5jzL7um1p4oFxVrpzo+Q7pG25wVVbue6t8WmeHrmpCkLUjNWjrVn6nQv1z8+sv5lvHNI2MbDQBaMdVLKbvQNEVe0oaIM9bRFiwrxhsiYcnXpug4JYUoKZVNbVoIeWZDqlbfI4T8FAy2WlU5TVjeN7SVexBOayKBviirToxoTX4KXEP4pu+MnDUdQDxWdSWfB1Bda/Lwct0yTh5rCHuHXW3H4evBDyMYrPEkMH04qqlyzgRbyTOANvekP8SPkYnxuxTsPubgNCTH5PSpUjU8suLeJ1l5RyzvFQyjn0bDIK1BKyEk75No7pGbpV+cr6qa3u2lq5Gu+0oaVala12oiZFpUkhZTfQJLtqXvNnjfxX1Vg9WaYMvTzYujnG+4VtAV6Wu5ACGP8NAZnhdYrvIEYUS1pLwlks5YK0GHh7h+VnMD9qxkoHBtTv/qK06hsUBfECuMJA/Jo7ghstR6Xk/1Wbj8JiD8ZVNtqOcEeEnWS8HqXjXD2Z9i2ZF8Q9ZULEGEDWuXErKwbFi+Ecs34iUfO+U/yJfkKicmJGVPfP//xwQBfx6OEr2RXIP/l8kVlOmWPEHRQBrFoacvoSrYfmhzHuKHFzTzYz/DqRGkTmY4aRAYAYpsw/PtKJ7Yseu43ncIhnthzkgvy4MeFPRUd6D4H0zXZDdaMAr7qnil8YIOH0PNPwyj7bsKWN18dxXdilflqKW2u6/agm2numG7wQTCej5uWAj0o20H+31VyBLiRIF93PuNVusSSGOMkWoVbilyU/3FzqLUxnFipC5yDMeDbPhRGhnYi5w0s3wvCYKBlPmG1XDNArth1tqhNW7V1YvhPlfzkGdd46E6g18WeKjj+FhO6hxaQU2DY4CRFSgPupNXQg4zqLACethB0QQFjoFS2zUcP7AM37EtY+YkVupO0iSNXVUi9ZoI/4/LcmiGcHz/KJYl4XLBQe3w1prTVUwEaGofEPB9SzZ2/RjZQNHJMOgJB8iIY88x3CSz3QlOZqmbvZJV4a8+eVX55vA0JbKHNlYdPKxDNWaH3ePmar9xqNO79gvnicr74el/c7yF6Gt6onN2d6Lj7Ov14vpE36t08XCfneocXcdJdLp/NJ9HfyzS38cjzH9MqDkUXI2DTM1RJhd/AwAA//8DAFBLAwQUAAYACAAAACEAgT6Ul/MAAAC6AgAAGgAIAXhsL19yZWxzL3dvcmtib29rLnhtbC5yZWxzIKIEASigAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArFJNS8QwEL0L/ocwd5t2FRHZdC8i7FXrDwjJtCnbJiEzfvTfGyq6XVjWSy8Db4Z5783Hdvc1DuIDE/XBK6iKEgR6E2zvOwVvzfPNAwhi7a0egkcFExLs6uur7QsOmnMTuT6SyCyeFDjm+CglGYejpiJE9LnShjRqzjB1Mmpz0B3KTVney7TkgPqEU+ytgrS3tyCaKWbl/7lD2/YGn4J5H9HzGQlJPA15ANHo1CEr+MFF9gjyvPxmTXnOa8Gj+gzlHKtLHqo1PXyGdCCHyEcffymSc+WimbtV7+F0QvvKKb/b8izL9O9m5MnH1d8AAAD//wMAUEsDBBQABgAIAAAAIQCWTjGZkwIAANcEAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1snJNLr5swEIX3lfofLO+JMQk0QSFXadKod1f1uXbMEKxgTG3npar/vWNQkkrZRFfCyDbDd+bgw/zlrBtyBOuUaQvKRzEl0EpTqnZX0B/fN9GUEudFW4rGtFDQCzj6snj/bn4ydu9qAE+Q0LqC1t53OWNO1qCFG5kOWnxSGauFx6XdMddZEGX/km5YEscZ00K1dCDk9hmGqSolYW3kQUPrB4iFRnjs39Wqc1eals/gtLD7QxdJoztEbFWj/KWHUqJl/rprjRXbBn2f+URIcrZ4JTjGV5l+/0FJK2mNM5UfIZkNPT/an7EZE/JGevT/FIZPmIWjCgd4RyVva4mnN1Zyh43fCMtusPC5bH5QZUH/bGKe8XQ6jpJstY4m2cdP0XI5nkXr7APHSPB1slr+pYt5qfCEgytioSrokufLhLLFvM/PTwUn99+ceLH9Bg1ID6jBKQnx3BqzD4WvuBUj0fUFgSikV0dYQdMgGJ2634NGL8BuCov5fX5V2/SB/mJJCZU4NP6rOX0Gtas9yqZoM+QkLy9rcBIDisKjJA1tS9MgAu9Eq/CnYcDEeWhVlb4u6HgySqYpTzOsJ1twfqMCkxJ5cN7oX0MVDyzWw/4BAAD//wAAAP//sinOSE0tcUksSbSzKcovVyiyVTJUUiguSMwrBrKsgOwKQ5PEZKuUSpfU4uTUvBJbJQM9I1MlO5tkkFpHoAKgUDGQX2ZnYKNfZmejnwzEQKPg5hmRYh5QMdw8QzTz9BFuBQAAAP//AAAA//+yKUhMT/VNLErPzCtWyElNK7FVMtAzV1IoykzPgLFL8gvAoqZKCkn5JSX5uTBeRmpiSmoRiGespJCWn18C4+jb2eiX5xdlF2ekppbYAQAAAP//AwBQSwMEFAAGAAgAAAAhAMEXEL5OBwAAxiAAABMAAAB4bC90aGVtZS90aGVtZTEueG1s7FnNixs3FL8X+j8Mc3f8NeOPJd7gz2yT3SRknZQctbbsUVYzMpK8GxMCJTn1UiikpZdCbz2U0kADDb30jwkktOkf0SfN2COt5SSbbEpadg2LR/69p6f3nn5683Tx0r2YekeYC8KSll++UPI9nIzYmCTTln9rOCg0fE9IlIwRZQlu+Qss/Evbn35yEW3JCMfYA/lEbKGWH0k52yoWxQiGkbjAZjiB3yaMx0jCI58Wxxwdg96YFiulUq0YI5L4XoJiUHt9MiEj7A2VSn97qbxP4TGRQg2MKN9XqrElobHjw7JCiIXoUu4dIdryYZ4xOx7ie9L3KBISfmj5Jf3nF7cvFtFWJkTlBllDbqD/MrlMYHxY0XPy6cFq0iAIg1p7pV8DqFzH9ev9Wr+20qcBaDSClaa22DrrlW6QYQ1Q+tWhu1fvVcsW3tBfXbO5HaqPhdegVH+whh8MuuBFC69BKT5cw4edZqdn69egFF9bw9dL7V5Qt/RrUERJcriGLoW1ane52hVkwuiOE94Mg0G9kinPUZANq+xSU0xYIjflWozuMj4AgAJSJEniycUMT9AIsriLKDngxNsl0wgSb4YSJmC4VCkNSlX4rz6B/qYjirYwMqSVXWCJWBtS9nhixMlMtvwroNU3IC+ePXv+8Onzh789f/To+cNfsrm1KktuByVTU+7Vj1///f0X3l+//vDq8Tfp1CfxwsS//PnLl7//8Tr1sOLcFS++ffLy6ZMX333150+PHdrbHB2Y8CGJsfCu4WPvJothgQ778QE/ncQwQsSSQBHodqjuy8gCXlsg6sJ1sO3C2xxYxgW8PL9r2bof8bkkjpmvRrEF3GOMdhh3OuCqmsvw8HCeTN2T87mJu4nQkWvuLkqsAPfnM6BX4lLZjbBl5g2KEommOMHSU7+xQ4wdq7tDiOXXPTLiTLCJ9O4Qr4OI0yVDcmAlUi60Q2KIy8JlIITa8s3eba/DqGvVPXxkI2FbIOowfoip5cbLaC5R7FI5RDE1Hb6LZOQycn/BRyauLyREeoop8/pjLIRL5jqH9RpBvwoM4w77Hl3ENpJLcujSuYsYM5E9dtiNUDxz2kySyMR+Jg4hRZF3g0kXfI/ZO0Q9QxxQsjHctwm2wv1mIrgF5GqalCeI+mXOHbG8jJm9Hxd0grCLZdo8tti1zYkzOzrzqZXauxhTdIzGGHu3PnNY0GEzy+e50VciYJUd7EqsK8jOVfWcYAFlkqpr1ilylwgrZffxlG2wZ29xgngWKIkR36T5GkTdSl045ZxUep2ODk3gNQLlH+SL0ynXBegwkru/SeuNCFlnl3oW7nxdcCt+b7PHYF/ePe2+BBl8ahkg9rf2zRBRa4I8YYYICgwX3YKIFf5cRJ2rWmzulJvYmzYPAxRGVr0Tk+SNxc+Jsif8d8oedwFzBgWPW/H7lDqbKGXnRIGzCfcfLGt6aJ7cwHCSrHPWeVVzXtX4//uqZtNePq9lzmuZ81rG9fb1QWqZvHyByibv8uieT7yx5TMhlO7LBcW7Qnd9BLzRjAcwqNtRuie5agHOIviaNZgs3JQjLeNxJj8nMtqP0AxaQ2XdwJyKTPVUeDMmoGOkh3UrFZ/QrftO83iPjdNOZ7msupqpCwWS+XgpXI1Dl0qm6Fo9796t1Ot+6FR3WZcGKNnTGGFMZhtRdRhRXw5CFF5nhF7ZmVjRdFjRUOqXoVpGceUKMG0VFXjl9uBFveWHQdpBhmYclOdjFae0mbyMrgrOmUZ6kzOpmQFQYi8zII90U9m6cXlqdWmqvUWkLSOMdLONMNIwghfhLDvNlvtZxrqZh9QyT7liuRtyM+qNDxFrRSInuIEmJlPQxDtu+bVqCLcqIzRr+RPoGMPXeAa5I9RbF6JTuHYZSZ5u+HdhlhkXsodElDpck07KBjGRmHuUxC1fLX+VDTTRHKJtK1eAED5a45pAKx+bcRB0O8h4MsEjaYbdGFGeTh+B4VOucP6qxd8drCTZHMK9H42PvQM65zcRpFhYLysHjomAi4Ny6s0xgZuwFZHl+XfiYMpo17yK0jmUjiM6i1B2ophknsI1ia7M0U8rHxhP2ZrBoesuPJiqA/a9T903H9XKcwZp5memxSrq1HST6Yc75A2r8kPUsiqlbv1OLXKuay65DhLVeUq84dR9iwPBMC2fzDJNWbxOw4qzs1HbtDMsCAxP1Db4bXVGOD3xric/yJ3MWnVALOtKnfj6yty81WYHd4E8enB/OKdS6FBCb5cjKPrSG8iUNmCL3JNZjQjfvDknLf9+KWwH3UrYLZQaYb8QVINSoRG2q4V2GFbL/bBc6nUqD+BgkVFcDtPr+gFcYdBFdmmvx9cu7uPlLc2FEYuLTF/MF7Xh+uK+XNl8ce8RIJ37tcqgWW12aoVmtT0oBL1Oo9Ds1jqFXq1b7w163bDRHDzwvSMNDtrVblDrNwq1crdbCGolZX6jWagHlUo7qLcb/aD9ICtjYOUpfWS+APdqu7b/AQAA//8DAFBLAwQUAAYACAAAACEAeaGAbKQCAABSBgAADQAAAHhsL3N0eWxlcy54bWykVW1r2zAQ/j7YfxD67sp24ywJtsvS1FDoxqAd7Ktiy4moXowkZ87G/vtOdl4cOrbRfolO59Nzz91zUtKbTgq0Y8ZyrTIcXYUYMVXqiqtNhr8+FcEMI+uoqqjQimV4zyy+yd+/S63bC/a4ZcwhgFA2w1vnmgUhttwySe2VbpiCL7U2kjrYmg2xjWG0sv6QFCQOwymRlCs8ICxk+T8gkprntglKLRvq+JoL7vY9FkayXNxvlDZ0LYBqF01oibpoamLUmWOS3vsij+Sl0VbX7gpwia5rXrKXdOdkTmh5RgLk1yFFCQnji9o780qkCTFsx718OE9rrZxFpW6VAzGBqG/B4lnp76rwn7xziMpT+wPtqABPhEmellpogxxIB53rPYpKNkTcUsHXhvuwmkou9oM79o5e7UOc5NB77ySex2GxcIgLcWIVewLgyFOQzzGjCtigg/20byC9gkkbYPq4f0RvDN1HcTI6QPqEebrWpoLJPvfj6MpTwWoHRA3fbP3qdAO/a+0cqJ+nFacbrajwpQwgJwPKKZkQj376v9UX2F2NVCsL6e6rDMM98k04mlDIwRzwho3HH6MN2G+GRV19iQ+II9oXpE/pkdc7w5/9dRUwOQcItG65cFz9gTBgVt25BaFXwPmr1zfnlAU6UbGatsI9nT5m+Gx/YhVvZXyK+sJ32vUQGT7bD16paOpzsM49WBgvWFFreIZ/3i0/zFd3RRzMwuUsmFyzJJgny1WQTG6Xq1UxD+Pw9tfoAXjD9e/fqzyFi7WwAh4Jcyj2UOLj2Zfh0Wag388o0B5zn8fT8GMShUFxHUbBZEpnwWx6nQRFEsWr6WR5lxTJiHvyymciJFE0PDiefLJwXDLB1VGro0JjL4gE278UQY5KkPOfQf4bAAD//wMAUEsDBBQABgAIAAAAIQCyptb50AAAAAABAAAUAAAAeGwvc2hhcmVkU3RyaW5ncy54bWxEj8FOxCAURfcm/gNh70ApM4UJMAsTv0A/4BVep01aqH3U6N9bY4zLk3vO4rrb5zKzD9xoKtnz5iQ5wxxLmvLd87fXlyfDGVXICeaS0fMvJH4Ljw+OqLKjzeT5WOt6FYLiiAvQqayYj2Uo2wL1wO0uaN0QEo2IdZmFkvIiFpgyZ7HsuXquONvz9L7j8x8HR1NwNUjbG90m1SUDWjep19GY2Ayy7Q1aACdqcOLH/fW7TkNUZ6UTJN0PrYntxUJs7Fkmk2z374vjQfgGAAD//wMAUEsDBBQABgAIAAAAIQCXGzMyQwEAAGkCAAARAAgBZG9jUHJvcHMvY29yZS54bWwgogQBKKAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACMklFPwyAUhd9N/A8N7y20M9OQtkvU7MklJtZofCNwt5EVSoDZ7d9L261W54OPcM79OOeGfHFQdfQJ1slGFyhNCIpA80ZIvSnQa7WM71DkPNOC1Y2GAh3BoUV5fZVzQ3lj4dk2BqyX4KJA0o5yU6Ct94Zi7PgWFHNJcOggrhurmA9Hu8GG8R3bAM4ImWMFngnmGe6AsRmJ6IQUfESava17gOAYalCgvcNpkuJvrwer3J8DvTJxKumPJnQ6xZ2yBR/E0X1wcjS2bZu0sz5GyJ/i99XTS181lrrbFQdU5oJTboH5xpYruYOoCtvYC5njidAtsWbOr8K+1xLE/fGX91IP3L7GAAcRhWB0qHFW3mYPj9USlRnJbmIyi9O7Kp3TNKPk9qN7/sd8F3S4UKcQ/yfOKckmxDOgzPHF5yi/AAAA//8DAFBLAwQUAAYACAAAACEAYUkJEIkBAAARAwAAEAAIAWRvY1Byb3BzL2FwcC54bWwgogQBKKAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACckkFv2zAMhe8D+h8M3Rs53VAMgaxiSFf0sGEBkrZnTaZjobIkiKyR7NePttHU2XrqjeR7ePpESd0cOl/0kNHFUInlohQFBBtrF/aVeNjdXX4VBZIJtfExQCWOgOJGX3xSmxwTZHKABUcErERLlFZSom2hM7hgObDSxNwZ4jbvZWwaZ+E22pcOAsmrsryWcCAINdSX6RQopsRVTx8NraMd+PBxd0wMrNW3lLyzhviW+qezOWJsqPh+sOCVnIuK6bZgX7Kjoy6VnLdqa42HNQfrxngEJd8G6h7MsLSNcRm16mnVg6WYC3R/eG1XovhtEAacSvQmOxOIsQbb1Iy1T0hZP8X8jC0AoZJsmIZjOffOa/dFL0cDF+fGIWACYeEccefIA/5qNibTO8TLOfHIMPFOONuBbzpzzjdemU/6J3sdu2TCkYVT9cOFZ3xIu3hrCF7XeT5U29ZkqPkFTus+DdQ9bzL7IWTdmrCH+tXzvzA8/uP0w/XyelF+LvldZzMl3/6y/gsAAP//AwBQSwECLQAUAAYACAAAACEAYu6daF4BAACQBAAAEwAAAAAAAAAAAAAAAAAAAAAAW0NvbnRlbnRfVHlwZXNdLnhtbFBLAQItABQABgAIAAAAIQC1VTAj9AAAAEwCAAALAAAAAAAAAAAAAAAAAJcDAABfcmVscy8ucmVsc1BLAQItABQABgAIAAAAIQAbL6Z9mAMAAOoIAAAPAAAAAAAAAAAAAAAAALwGAAB4bC93b3JrYm9vay54bWxQSwECLQAUAAYACAAAACEAgT6Ul/MAAAC6AgAAGgAAAAAAAAAAAAAAAACBCgAAeGwvX3JlbHMvd29ya2Jvb2sueG1sLnJlbHNQSwECLQAUAAYACAAAACEAlk4xmZMCAADXBAAAGAAAAAAAAAAAAAAAAAC0DAAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1sUEsBAi0AFAAGAAgAAAAhAMEXEL5OBwAAxiAAABMAAAAAAAAAAAAAAAAAfQ8AAHhsL3RoZW1lL3RoZW1lMS54bWxQSwECLQAUAAYACAAAACEAeaGAbKQCAABSBgAADQAAAAAAAAAAAAAAAAD8FgAAeGwvc3R5bGVzLnhtbFBLAQItABQABgAIAAAAIQCyptb50AAAAAABAAAUAAAAAAAAAAAAAAAAAMsZAAB4bC9zaGFyZWRTdHJpbmdzLnhtbFBLAQItABQABgAIAAAAIQCXGzMyQwEAAGkCAAARAAAAAAAAAAAAAAAAAM0aAABkb2NQcm9wcy9jb3JlLnhtbFBLAQItABQABgAIAAAAIQBhSQkQiQEAABEDAAAQAAAAAAAAAAAAAAAAAEcdAABkb2NQcm9wcy9hcHAueG1sUEsFBgAAAAAKAAoAgAIAAAYgAAAAAA==",
            ),
          ),
        ],
        `xlsx/${filenameRoot}.xlsx`,
      );
      break;
    case "c909d4ffd708476789e22664051629a0":
      /*
      Two-row, one-column spreadsheet with the following content:
        c909d4ffd708476789e22664051629a0
        774ac2524dad4bf38c369ac1950d8d97
      */
      return new File(
        [
          _binaryToUint8CharCodes(
            atob(
              "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",
            ),
          ),
        ],
        `xlsx/${filenameRoot}.xlsx`,
      );
      break;
  }
}

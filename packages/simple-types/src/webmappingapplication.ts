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

import * as auth from "@esri/arcgis-rest-auth";
import * as common from "@esri/solution-common";
import { request } from "@esri/arcgis-rest-request";

// ------------------------------------------------------------------------------------------------------------------ //

export function convertItemToTemplate(
  itemTemplate: common.IItemTemplate,
  authentication: auth.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Remove org base URL and app id, e.g.,
    //   http://anOrg.maps.arcgis.com/apps/CrowdsourcePolling/index.html?appid=6fc5992522d34a6b5ce80d17835eea21
    // to
    //   <PLACEHOLDER_SERVER_NAME>/apps/CrowdsourcePolling/index.html?appid={{<itemId>.id}}
    // Need to add placeholder server name because otherwise AGOL makes URL null
    let portalUrl: string = "";
    if (itemTemplate.item.url) {
      const templatizedUrl = itemTemplate.item.url;
      const iSep = templatizedUrl.indexOf("//");
      itemTemplate.item.url =
        common.PLACEHOLDER_SERVER_NAME + // add placeholder server name
        templatizedUrl.substring(
          templatizedUrl.indexOf("/", iSep + 2),
          templatizedUrl.lastIndexOf("=") + 1
        ) +
        itemTemplate.item.id; // templatized id

      portalUrl = templatizedUrl.replace(
        templatizedUrl.substring(templatizedUrl.indexOf("/", iSep + 2)),
        ""
      );
    }

    // Extract dependencies
    itemTemplate.dependencies = _extractDependencies(itemTemplate);

    // Set the folder
    common.setProp(itemTemplate, "data.folderId", "{{folderId}}");
    // Set the map or group after we've extracted them as dependencies
    _templatizeIdPaths(itemTemplate, [
      "data.map.itemId",
      "data.map.appProxy.mapItemId",
      "data.appItemId",
      "data.values.webmap",
      "data.values.group"
    ]);

    setValues(
      itemTemplate,
      [
        "data.logo",
        "data.map.portalUrl",
        "data.portalUrl",
        "data.httpProxy.url"
      ],
      common.PLACEHOLDER_SERVER_NAME
    );

    common.setProp(
      itemTemplate,
      "data.geometryService",
      common.PLACEHOLDER_GEOMETRY_SERVER_NAME
    );

    templatizeDatasources(itemTemplate, authentication, portalUrl).then(
      () => {
        templatizeWidgets(
          itemTemplate,
          authentication,
          portalUrl,
          "data.widgetPool.widgets"
        ).then(
          _itemTemplate => {
            templatizeWidgets(
              _itemTemplate,
              authentication,
              portalUrl,
              "data.widgetOnScreen.widgets"
            ).then(
              updatedItemTemplate => {
                resolve(updatedItemTemplate);
              },
              e => reject(common.fail(e))
            );
          },
          e => reject(common.fail(e))
        );
      },
      e => reject(common.fail(e))
    );
  });
}

export function templatizeDatasources(
  itemTemplate: common.IItemTemplate,
  authentication: auth.UserSession,
  portalUrl: string
) {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    const dataSources: any = common.getProp(
      itemTemplate,
      "data.dataSource.dataSources"
    );
    if (dataSources && Object.keys(dataSources).length > 0) {
      Object.keys(dataSources).forEach(k => {
        const ds: any = dataSources[k];
        common.setProp(ds, "portalUrl", common.PLACEHOLDER_SERVER_NAME);
        if (common.getProp(ds, "itemId")) {
          ds.itemId = common.templatizeTerm(ds.itemId, ds.itemId, ".id");
        }
        if (common.getProp(ds, "url")) {
          const urlResults: any = findUrls(
            ds.url,
            portalUrl,
            [],
            [],
            authentication
          );
          handleServiceRequests(
            urlResults.serviceRequests,
            urlResults.requestUrls,
            urlResults.testString
          ).then(
            response => {
              ds.url = response;
              resolve(itemTemplate);
            },
            e => {
              reject(common.fail(e));
            }
          );
        } else {
          resolve(itemTemplate);
        }
      });
    } else {
      resolve(itemTemplate);
    }
  });
}

export function templatizeWidgets(
  itemTemplate: common.IItemTemplate,
  authentication: auth.UserSession,
  portalUrl: string,
  widgetPath: string
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // update widgets
    const widgets: any[] = common.getProp(itemTemplate, widgetPath) || [];
    let serviceRequests: any[] = [];
    let requestUrls: string[] = [];

    widgets.forEach(widget => {
      if (common.getProp(widget, "icon")) {
        setValues(widget, ["icon"], common.PLACEHOLDER_SERVER_NAME);
      }
      const config: any = widget.config;
      if (config) {
        const sConfig: string = JSON.stringify(config);
        const urlResults: any = findUrls(
          sConfig,
          portalUrl,
          requestUrls,
          serviceRequests,
          authentication
        );

        widget.config = JSON.parse(urlResults.testString);
        serviceRequests = urlResults.serviceRequests;
        requestUrls = urlResults.requestUrls;
      }
    });

    const sWidgets: string = JSON.stringify(widgets);
    handleServiceRequests(serviceRequests, requestUrls, sWidgets).then(
      response => {
        common.setProp(itemTemplate, widgetPath, JSON.parse(response));
        resolve(itemTemplate);
      },
      e => reject(common.fail(e))
    );
  });
}

export function handleServiceRequests(
  serviceRequests: any[],
  requestUrls: string[],
  objString: string
) {
  return new Promise<string>((resolve, reject) => {
    if (serviceRequests && serviceRequests.length > 0) {
      let i: number = 0;
      Promise.all(serviceRequests).then(
        serviceResponses => {
          serviceResponses.forEach(serviceResponse => {
            if (common.getProp(serviceResponse, "serviceItemId")) {
              const serviceTemplate: string =
                "{{" +
                serviceResponse.serviceItemId +
                ".url}}/" +
                (serviceResponse.hasOwnProperty("id")
                  ? serviceResponse.id
                  : "");
              objString = replaceUrl(
                objString,
                requestUrls[i],
                serviceTemplate
              );
            }
            i++;
          });
          resolve(objString);
        },
        e => reject(common.fail(e))
      );
    } else {
      resolve(objString);
    }
  });
}

export function findUrls(
  testString: string,
  portalUrl: string,
  requestUrls: string[],
  serviceRequests: any[],
  authentication: auth.UserSession
) {
  const options: any = {
    f: "json",
    authentication: authentication
  };
  // test for URLs
  const results = testString.match(/(\bhttps?:\/\/[-A-Z0-9\/._]*)/gim);
  if (results && results.length) {
    results.forEach((url: string) => {
      if (url.indexOf("NAServer") > -1) {
        testString = replaceUrl(
          testString,
          url,
          common.PLACEHOLDER_NA_SERVER_NAME
        );
      } else if (url.indexOf("GeocodeServer") > -1) {
        testString = replaceUrl(
          testString,
          url,
          common.PLACEHOLDER_GEOCODE_SERVER_NAME
        );
      } else if (portalUrl && url.indexOf(portalUrl) > -1) {
        testString = replaceUrl(
          testString,
          url,
          common.PLACEHOLDER_SERVER_NAME
        );
      } else if (url.indexOf("FeatureServer") > -1) {
        if (requestUrls.indexOf(url) === -1) {
          requestUrls.push(url);
          serviceRequests.push(request(url, options));
        }
      }
    });
  }
  return {
    testString,
    requestUrls,
    serviceRequests
  };
}

export function replaceUrl(obj: string, url: string, newUrl: string) {
  const re = new RegExp(url, "gmi");
  return obj.replace(re, newUrl);
}

export function setValues(
  itemTemplate: common.IItemTemplate,
  paths: string[],
  base: string
) {
  paths.forEach(path => {
    const url: string = common.getProp(itemTemplate, path);
    if (url) {
      const subString: string = url.substring(
        url.indexOf("/", url.indexOf("//") + 2)
      );
      common.setProp(
        itemTemplate,
        path,
        subString !== url ? base + subString : base
      );
    }
  });
}

export function fineTuneCreatedItem(
  originalTemplate: common.IItemTemplate,
  newlyCreatedItem: common.IItemTemplate,
  templateDictionary: any,
  destinationAuthentication: auth.UserSession
): Promise<void> {
  return new Promise<void>(resolve => {
    // If this is a Web AppBuilder application, we will create a Code Attachment for downloading
    if (
      common.hasAnyKeyword(originalTemplate, [
        "WAB2D",
        "WAB3D",
        "Web AppBuilder"
      ])
    ) {
      common
        .createItemWithData(
          {
            tags: originalTemplate.item.tags,
            title: originalTemplate.item.title,
            type: "Code Attachment",
            typeKeywords: ["Code", "Javascript", "Web Mapping Application"],
            relationshipType: "WMA2Code",
            originItemId: newlyCreatedItem.itemId,
            url:
              common.replaceInTemplate(
                common.PLACEHOLDER_SERVER_NAME,
                templateDictionary
              ) +
              "/sharing/rest/content/items/" +
              newlyCreatedItem.itemId +
              "/package"
          },
          {},
          destinationAuthentication,
          templateDictionary.folderId
        )
        .then(() => resolve(), () => resolve());
    } else {
      // Otherwise, nothing extra needed
      resolve();
    }
  });
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Gets the ids of the dependencies of an AGOL webapp item.
 *
 * @param fullItem A webapp item whose dependencies are sought
 * @return A promise that will resolve with list of dependent ids
 * @protected
 */
export function _extractDependencies(model: any): string[] {
  let processor = _getGenericWebAppDependencies;

  /*
  if (common.hasTypeKeyword(model, "Story Map")) {
    processor = getStoryMapDependencies;
  }
  */

  if (common.hasAnyKeyword(model, ["WAB2D", "WAB3D", "Web AppBuilder"])) {
    processor = _getWABDependencies;
  }

  return processor(model);
}

/**
 * Generic Web App Dependencies
 */
export function _getGenericWebAppDependencies(model: any): any {
  const props = ["data.values.webmap", "data.values.group"];
  return common.getProps(model, props);
}

export function _getWABDependencies(model: any): any {
  const deps = [] as string[];
  const v = common.getProp(model, "data.map.itemId");
  if (v) {
    deps.push(v);
  }
  const dataSources = common.getProp(model, "data.dataSource.dataSources");
  if (dataSources) {
    Object.keys(dataSources).forEach(k => {
      const ds: any = dataSources[k];
      if (ds.itemId) {
        deps.push(ds.itemId);
      }
    });
  }
  return deps;
}

/**
 * Templatizes id properties for the paths provided
 *
 * @param itemTemplate The solution item template
 * @param paths A list of property paths that contain ids
 * @protected
 */
export function _templatizeIdPaths(
  itemTemplate: common.IItemTemplate,
  paths: string[]
) {
  paths.forEach(path => {
    const id: any = common.getProp(itemTemplate, path);
    common.setProp(itemTemplate, path, common.templatizeTerm(id, id, ".id"));
  });
}

/**
 * Templatize field references for datasources and widgets.
 *
 * @param solutionTemplate The solution item template
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns The solutionTemplate with templatized field references
 */
export function postProcessFieldReferences(
  solutionTemplate: common.IItemTemplate,
  datasourceInfos: common.IDatasourceInfo[]
): common.IItemTemplate {
  const dataSources: any = common.getProp(
    solutionTemplate,
    "data.dataSource.dataSources"
  );
  if (dataSources && Object.keys(dataSources).length > 0) {
    Object.keys(dataSources).forEach(k => {
      const ds: any = dataSources[k];
      dataSources[k] = _templatizeDatasourceFieldReferences(
        ds,
        datasourceInfos
      );
    });
    common.setProp(
      solutionTemplate,
      "data.dataSource.dataSources",
      dataSources
    );
  }

  const paths: string[] = [
    "data.widgetPool.widgets",
    "data.widgetOnScreen.widgets"
  ];
  paths.forEach(path => {
    const widgets = common.getProp(solutionTemplate, path);
    if (widgets) {
      common.setProp(
        solutionTemplate,
        path,
        _templatizeWidgetFieldReferences(widgets, datasourceInfos)
      );
    }
  });

  return solutionTemplate;
}

/**
 * Templatize field references for given dataSource from the web application.
 *
 * @param dataSource The dataSource object from the web application.
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns The dataSource with templatized field references
 */
export function _templatizeDatasourceFieldReferences(
  dataSource: any,
  datasourceInfos: common.IDatasourceInfo[]
): any {
  dataSource = _prioritizedTests(dataSource, datasourceInfos);
  const replaceOrder: common.IDatasourceInfo[] = _getReplaceOrder(
    dataSource,
    datasourceInfos
  );
  replaceOrder.forEach(ds => {
    dataSource = common.templatizeFieldReferences(
      dataSource,
      ds.fields,
      ds.basePath
    );
  });
  return dataSource;
}

/**
 * Templatize field references for the widgets from the web application.
 *
 * @param widgets A list of widgets from the web application.
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns The widgets with templatized field references
 */
export function _templatizeWidgetFieldReferences(
  widgets: any[],
  datasourceInfos: common.IDatasourceInfo[]
): any {
  return widgets.map(widget => {
    widget = _prioritizedTests(widget, datasourceInfos);
    const replaceOrder: common.IDatasourceInfo[] = _getReplaceOrder(
      widget,
      datasourceInfos
    );
    replaceOrder.forEach(ds => {
      widget = common.templatizeFieldReferences(widget, ds.fields, ds.basePath);
    });
    return widget;
  });
}

/**
 * Gets an order for testing wit the various datasource info objects against the widget or dataSource.
 * A widget or dataSource that contain a layers url or webmap layer id are more likely
 * to have field references from that layer.
 *
 * @param obj The dataSource or widget object from the web application.
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns A list of datasourceInfo objects sorted based on the presence of a layers url or id
 */
export function _getReplaceOrder(
  obj: any,
  datasourceInfos: common.IDatasourceInfo[]
) {
  const objString: string = JSON.stringify(obj);
  return datasourceInfos.sort((a, b) => {
    return _getSortOrder(a, objString) - _getSortOrder(b, objString);
  });
}

/**
 * Determine an order for checking field names against a dataSource or widget.
 * Sort order prefernce is set in this order: layer url, web map layer id, service url, agol itemId
 *
 * @param datasourceInfo The datasource object with key properties about the service.
 * @param testString A stringified version of a widget or dataSource
 * @returns The prioritized order for testing
 */
export function _getSortOrder(
  datasourceInfo: common.IDatasourceInfo,
  testString: string
) {
  const url = datasourceInfo.url;
  const itemId = datasourceInfo.itemId;
  const layerId = datasourceInfo.layerId;

  // if we have the url and the layerID and its found prioritize it first
  // else if we find the maps layer id prioritze it first
  let layerUrlTest: any;
  if (url && !isNaN(layerId)) {
    layerUrlTest = new RegExp(url + "/" + layerId, "gm");
  }
  if (layerUrlTest && layerUrlTest.test(testString)) {
    return 1;
  } else if (datasourceInfo.ids.length > 0) {
    if (
      datasourceInfo.ids.some(id => {
        const layerMapIdTest: any = new RegExp(id, "gm");
        return layerMapIdTest.test(testString);
      })
    ) {
      return 1;
    }
  }

  // if neither full layer url or map layer id are found...check to see if we can
  // find the base service url
  if (url) {
    const serviceUrlTest: any = new RegExp(url, "gm");
    if (serviceUrlTest.test(testString)) {
      return 2;
    }
  }
  // if none of the above see if we can find an AGOL item id reference
  const itemIdTest: any = new RegExp(itemId, "gm");
  if (itemIdTest.test(testString)) {
    return 3;
  }
  return 4;
}

/**
 * These tests will run prior to the tests associated with the higher level tests based on sort order.
 * The tests work more like cloning an object where we go through and review each individual property.
 * If we find a url or webmap layer id we will templatize the parent object that contains this property.
 * Many widgets will store one of these two properties in an object that will also contain various field references.
 *
 * @param obj The dataSource or widget object from the application
 * @param datasourceInfos A list of datasource info objects that contain key values to templatize field references
 * @returns An updated instance of the dataSource or widget with as many field references templatized as possible.
 */
export function _prioritizedTests(
  obj: any,
  datasourceInfos: common.IDatasourceInfo[]
): any {
  const objString: string = JSON.stringify(obj);
  const hasDatasources = datasourceInfos.filter(ds => {
    const urlTest: any = new RegExp(ds.url + "/" + ds.layerId, "gm");
    let hasMapLayerId: boolean = false;
    if (ds.ids.length > 0) {
      hasMapLayerId = ds.ids.some(id => {
        const idTest: any = new RegExp(id, "gm");
        return idTest.test(objString);
      });
    }

    if (hasMapLayerId || urlTest.test(objString)) {
      return ds;
    }
  });
  if (hasDatasources.length > 1) {
    hasDatasources.forEach(ds => {
      // specific url reference is the most common
      obj = _templatizeParentByURL(obj, ds);
      if (ds.ids.length > 0) {
        // the second most common is to use the layerId from the webmap
        ds.ids.forEach(id => {
          obj = _templatizeParentByWebMapLayerId(obj, ds, id);
        });
      }
    });
  }
  return obj;
}

/**
 * This is very close to common.cloneObject but will test if an object
 * has one of the datasource urls as a property. If it finds one it will
 * templatize it's parent based on the fields from that datasource
 *
 * @param obj The dataSource or widget object from the application
 * @param ds A datasourceInfo object to use for testing against the current dataSource or widget
 * @returns The updated instance of the object with as many field references templatized as possible
 */
export function _templatizeParentByURL(
  obj: { [index: string]: any },
  ds: common.IDatasourceInfo
): any {
  let clone: { [index: string]: any } = {};
  const url = ds.url;
  const layerId = ds.layerId;
  const urlTest: any = new RegExp(url + "/" + layerId, "gm");
  if (Array.isArray(obj)) {
    clone = obj.map(c => {
      return _templatizeParentByURL(c, ds);
    });
  } else if (typeof obj === "object") {
    for (const i in obj) {
      if (obj[i] != null && typeof obj[i] === "object") {
        clone[i] = _templatizeParentByURL(obj[i], ds);
      } else {
        if (urlTest.test(obj[i])) {
          obj = common.templatizeFieldReferences(obj, ds.fields, ds.basePath);
        }
        clone[i] = obj[i];
      }
    }
  } else {
    clone = obj;
  }
  return clone;
}

/**
 * This is very close to common.cloneObject but will test if an object
 * has one of the datasource webmap layer ids as a property. If it finds one it will
 * templatize it's parent based on the fields from that datasource.
 *
 * @param obj The dataSource or widget object from the application
 * @param ds A datasourceInfo object to use for testing against the current dataSource or widget
 * @param id A webmap layer id to test with.
 * @returns The updated instance of the object with as many field references templatized as possible
 */
export function _templatizeParentByWebMapLayerId(
  obj: { [index: string]: any },
  ds: common.IDatasourceInfo,
  id: string
): any {
  let clone: { [index: string]: any } = {};
  const idTest: any = new RegExp(id, "gm");
  if (Array.isArray(obj)) {
    clone = obj.map(c => {
      return _templatizeParentByWebMapLayerId(c, ds, id);
    });
  } else if (typeof obj === "object") {
    for (const i in obj) {
      if (obj[i] != null && typeof obj[i] === "object") {
        // some widgets store the layerId as a key to a collection of details that contain field references
        if (idTest.test(i)) {
          obj[i] = common.templatizeFieldReferences(
            obj[i],
            ds.fields,
            ds.basePath
          );
        }
        clone[i] = _templatizeParentByWebMapLayerId(obj[i], ds, id);
      } else {
        if (idTest.test(obj[i])) {
          obj = common.templatizeFieldReferences(obj, ds.fields, ds.basePath);
        }
        clone[i] = obj[i];
      }
    }
  } else {
    clone = obj;
  }
  return clone;
}

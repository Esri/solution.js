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
  requestOptions: auth.IUserRequestOptions
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
    if (common.getProp(itemTemplate, "data.folderId")) {
      itemTemplate.data.folderId = "{{folderId}}";
    }

    // Set the map or group after we've extracted them as dependencies
    if (common.getProp(itemTemplate, "data.map.appProxy.mapItemId")) {
      itemTemplate.data.map.appProxy.mapItemId = common.templatizeTerm(
        itemTemplate.data.map.appProxy.mapItemId,
        itemTemplate.data.map.appProxy.mapItemId,
        ".id"
      );
    }
    if (common.getProp(itemTemplate, "data.map.itemId")) {
      itemTemplate.data.map.itemId = common.templatizeTerm(
        itemTemplate.data.map.itemId,
        itemTemplate.data.map.itemId,
        ".id"
      );
    }
    if (common.getProp(itemTemplate, "data.appItemId")) {
      itemTemplate.data.appItemId = common.templatizeTerm(
        itemTemplate.data.appItemId,
        itemTemplate.data.appItemId,
        ".id"
      );
    }
    if (common.getProp(itemTemplate, "data.values.webmap")) {
      itemTemplate.data.values.webmap = common.templatizeTerm(
        itemTemplate.data.values.webmap,
        itemTemplate.data.values.webmap,
        ".id"
      );
    } else if (common.getProp(itemTemplate, "data.values.group")) {
      itemTemplate.data.values.group = common.templatizeTerm(
        itemTemplate.data.values.group,
        itemTemplate.data.values.group,
        ".id"
      );
    }

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

    templatizeDatasources(itemTemplate, requestOptions, portalUrl).then(
      () => {
        templatizeWidgets(
          itemTemplate,
          requestOptions,
          portalUrl,
          "data.widgetPool.widgets"
        ).then(
          _itemTemplate => {
            templatizeWidgets(
              _itemTemplate,
              requestOptions,
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
  requestOptions: auth.IUserRequestOptions,
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
            requestOptions
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
  requestOptions: auth.IUserRequestOptions,
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
          requestOptions
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
  requestOptions: auth.IUserRequestOptions
) {
  const options: any = {
    f: "json",
    requestOptions
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
export function _getGenericWebAppDependencies(model: any): string[] {
  const props = ["data.values.webmap", "data.values.group"];
  return common.getProps(model, props);
}

/**
 * Return a list of items this site depends on
 */
export function _getWABDependencies(model: any): string[] {
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

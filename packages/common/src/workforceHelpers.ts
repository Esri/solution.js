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
 * Provides general helper functions.
 *
 * @module featureServiceHelpers
 */

import { templatizeTerm } from "./templatization";
import { rest_queryFeatures } from "./featureServiceHelpers";
import {
  IItemTemplate,
  IFeatureServiceProperties,
  UserSession
} from "./interfaces";
import { getProp, fail } from "./generalHelpers";
import { rest_request } from "./restHelpers";

export function getWorkforceDependencies(
  itemTemplate: IItemTemplate,
  dependencies: any[]
): any {
  // if workforce v2 then we need to do some stuff
  const properties: any = itemTemplate.item.properties || {};
  const keyProperties: string[] = getKeyWorkforceProperties();
  dependencies = keyProperties.reduce(function(acc, v) {
    if (properties[v]) {
      acc.push(properties[v]);
    }
    return acc;
  }, []);

  // We also need the dependencies listed in the Assignment Integrations table
  const infos: any = getProp(
    itemTemplate,
    "properties.workforceInfos.assignmentIntegrationInfos"
  );
  if (infos && infos.length > 0) {
    infos.forEach((info: any) => {
      const infoKeys = Object.keys(info);
      if (infoKeys.indexOf("dependencies") > -1) {
        info["dependencies"].forEach((d: string) => {
          if (dependencies.indexOf(d) < 0) {
            dependencies.push(d);
          }
        });
      }
    });
  }

  return dependencies.map(d => {
    return { id: d, name: "" };
  });
}

export function getWorkforceServiceInfo(
  properties: IFeatureServiceProperties,
  url: string,
  authentication: UserSession
): Promise<IFeatureServiceProperties> {
  return new Promise<IFeatureServiceProperties>((resolve, reject) => {
    url = url.replace("/rest/admin/services", "/rest/services");
    const requests: any[] = [
      rest_queryFeatures({
        url: `${url}/3`,
        where: "1=1",
        authentication
      }),
      rest_queryFeatures({
        url: `${url}/4`,
        where: "1=1",
        authentication
      })
    ];

    Promise.all(requests).then(
      responses => {
        const [assignmentTypes, assignmentIntegrations] = responses;

        properties.workforceInfos = {
          assignmentTypeInfos: _getAssignmentTypeInfos(assignmentTypes)
        };

        _getAssignmentIntegrationInfos(
          assignmentIntegrations,
          authentication
        ).then(
          results => {
            properties.workforceInfos["assignmentIntegrationInfos"] = results;
            resolve(properties);
          },
          e => reject(fail(e))
        );
      },
      e => reject(fail(e))
    );
  });
}

export function _getAssignmentTypeInfos(assignmentTypes: any): any[] {
  // Assignment Types
  const assignmentTypeInfos: any[] = [];
  const keyAssignmentTypeProps = [
    "description",
    assignmentTypes.globalIdFieldName
  ];
  assignmentTypes.features.forEach((f: any) => {
    const info = {};
    keyAssignmentTypeProps.forEach(p => {
      info[p] = f.attributes[p];
    });
    assignmentTypeInfos.push(info);
  });
  return assignmentTypeInfos;
}

export function _getAssignmentIntegrationInfos(
  assignmentIntegrations: any,
  authentication: UserSession
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    let requests: Array<Promise<any>> = [];
    let urls: string[] = [];
    const assignmentIntegrationInfos: any[] = [];
    const keyAssignmentIntegrationsProps = [
      "appid",
      assignmentIntegrations.globalIdFieldName,
      "prompt",
      "urltemplate",
      "assignmenttype"
    ];
    assignmentIntegrations.features.forEach((f: any) => {
      const info = {};
      keyAssignmentIntegrationsProps.forEach(p => {
        info[p] = f.attributes[p];
        if (p === "urltemplate") {
          const urlTemplate = f.attributes[p];
          const ids: string[] = _getIDs(urlTemplate);
          info["dependencies"] = ids;
          ////////////////////////////////////////////////////
          // from workforce
          const serviceRequests: any = urlTest(urlTemplate, authentication);
          if (
            Array.isArray(serviceRequests.requests) &&
            serviceRequests.requests.length > 0
          ) {
            requests = requests.concat(serviceRequests.requests);
            urls = urls.concat(serviceRequests.urls);
          }
          ////////////////////////////////////////////////////
        }
      });
      assignmentIntegrationInfos.push(info);
    });

    getUrlDependencies(requests, urls).then(
      results => {
        assignmentIntegrationInfos.forEach(ai => {
          _templatizeUrlTemplate(ai, results.urlHash);
        });

        resolve(assignmentIntegrationInfos);
      },
      e => reject(fail(e))
    );
  });
}
//////////////////////////////////////////////////
// from workforce
export function getUrlDependencies(
  requests: Array<Promise<any>>,
  urls: string[]
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    const dependencies: any[] = [];
    if (requests.length > 0) {
      Promise.all(requests).then(
        results => {
          const urlHash: any = {};
          // Get the serviceItemId for the url
          /* istanbul ignore else */
          if (Array.isArray(results)) {
            results.forEach((result, i) => {
              /* istanbul ignore else */
              if (result.serviceItemId) {
                urlHash[urls[i]] = result.serviceItemId;
                /* istanbul ignore else */
                if (dependencies.indexOf(result.serviceItemId) === -1) {
                  dependencies.push(result.serviceItemId);
                }
              }
            });
          }
          resolve({
            dependencies,
            urlHash
          });
        },
        e => reject(fail(e))
      );
    } else {
      resolve({
        dependencies,
        urlHash: {}
      });
    }
  });
}

export function _templatizeUrlTemplate(item: any, urlHash: any): void {
  /* istanbul ignore else */
  if (getProp(item, "urltemplate")) {
    const ids: string[] = _getIDs(item.urltemplate);
    ids.forEach(id => {
      item.urltemplate = item.urltemplate.replace(
        id,
        templatizeTerm(id, id, ".itemId")
      );
    });
    const urls: string[] = _getURLs(item.urltemplate);
    urls.forEach(url => {
      const layerId = _getLayerId(url);
      const replaceValue: string = _getReplaceValue(layerId, ".url");
      item.urltemplate = item.urltemplate.replace(
        url,
        templatizeTerm(urlHash[url], urlHash[url], replaceValue)
      );
    });
  }
}

export function _getLayerId(url: string): any {
  return url.indexOf("FeatureServer/") > -1
    ? url.substr(url.lastIndexOf("/") + 1)
    : undefined;
}

export function _getReplaceValue(layerId: any, suffix: string): string {
  return isNaN(Number.parseInt(layerId, 10))
    ? `${suffix}`
    : `.layer${layerId}${suffix}`;
}
//////////////////////////////////////////////////

export function postProcessWorkforceTemplates(
  templates: IItemTemplate[]
): IItemTemplate[] {
  const groupUpdates: any = {};
  const _templates = templates.map(t => {
    // templatize Workforce Project
    t = _templatizeWorkforceProject(t, groupUpdates);

    // templatize Workforce Dispatcher
    t = _templatizeWorkforceDispatcherOrWorker(t, "Workforce Dispatcher");

    // templatize Workforce Worker
    t = _templatizeWorkforceDispatcherOrWorker(t, "Workforce Worker");

    return t;
  });

  return _templates.map(t => {
    if (groupUpdates[t.itemId]) {
      t.dependencies = t.dependencies.concat(groupUpdates[t.itemId]);
    }
    return t;
  });
}

export function _templatizeWorkforceProject(
  t: IItemTemplate,
  groupUpdates: any
): any {
  if ((t.item.typeKeywords || []).indexOf("Workforce Project") > -1) {
    const properties: any = t.item.properties || {};
    const keyProperties: string[] = getKeyWorkforceProperties();

    const groupId: string = properties["workforceProjectGroupId"];
    const shuffleIds: string[] = [];
    Object.keys(properties).forEach((p: any) => {
      if (keyProperties.indexOf(p) > -1) {
        const id: string = properties[p];
        if (id !== groupId) {
          shuffleIds.push(id);
        }
        t.item.properties[p] = templatizeTerm(
          properties[p],
          properties[p],
          ".itemId"
        );
      }
    });

    // update the dependencies
    t.dependencies = t.dependencies.filter(
      (d: string) => d !== groupId && shuffleIds.indexOf(d) < 0
    );

    // shuffle and cleanup
    const workforceInfos = getProp(t, "properties.workforceInfos");
    if (workforceInfos) {
      Object.keys(workforceInfos).forEach(k => {
        workforceInfos[k].forEach((wInfo: any) => {
          if (wInfo.dependencies) {
            wInfo.dependencies.forEach((id: string) => {
              if (shuffleIds.indexOf(id) < 0) {
                shuffleIds.push(id);
              }
              const depIndex = t.dependencies.indexOf(id);
              if (depIndex > -1) {
                t.dependencies.splice(depIndex, 1);
              }
            });
            delete wInfo.dependencies;
          }
        });
      });
    }

    // move the dependencies to the group
    groupUpdates[groupId] = shuffleIds;
  }
  return t;
}

export function _templatizeWorkforceDispatcherOrWorker(
  t: IItemTemplate,
  type: string
): IItemTemplate {
  if ((t.item.typeKeywords || []).indexOf(type) > -1) {
    const properties: any = t.item.properties || {};
    const fsId = properties["workforceFeatureServiceId"];
    if (fsId) {
      t.item.properties["workforceFeatureServiceId"] = templatizeTerm(
        fsId,
        fsId,
        ".itemId"
      );
    }
  }
  return t;
}

////////////////////////////////////////////////////////////////////////////////
// Helpers
export function isWorkforceProject(itemTemplate: IItemTemplate): boolean {
  return (
    (itemTemplate.item.typeKeywords || []).indexOf("Workforce Project") > -1
  );
}

export function getKeyWorkforceProperties(): string[] {
  return [
    "workforceDispatcherMapId",
    "workforceProjectGroupId",
    "workforceWorkerMapId"
  ];
}

//////////////////////////////////////////////////////
// Duplicated from workforce...TODO think about the structure
export function _getIDs(v: string): string[] {
  // avoid IDs that are in a FS url as part of service name
  // Only get IDs that are proceeded by '=' but do not return the '='
  return regExTest(v, /=[0-9A-F]{32}/gi).map(_v => _v.replace("=", ""));
}

export function regExTest(v: any, ex: RegExp): any[] {
  return v && ex.test(v) ? v.match(ex) : [];
}

/**
 * Test the provided value for any urls and submit a request to obtain the service item id for the url
 *
 * @param v a string value to test for urls
 * @param authentication credentials for the requests
 * @returns an object with any pending requests and the urls that requests were made to
 */
export function urlTest(v: any, authentication: UserSession): any {
  const _urls: any[] = _getURLs(v);
  const urls = _urls.map(url => url.replace("=", ""));
  const requests: Array<Promise<any>> = [];
  urls.forEach(url => {
    const options: any = {
      f: "json",
      authentication: authentication
    };
    requests.push(rest_request(url, options));
  });
  return {
    requests: requests,
    urls: urls
  };
}

export function _getURLs(v: string): string[] {
  return regExTest(v, /=(http.*?FeatureServer.*?(?=&|$))/gi).map(_v =>
    _v.replace("=", "")
  );
}
///////////////////////////////////////////////////////

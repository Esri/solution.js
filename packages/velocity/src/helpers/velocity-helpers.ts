/** @license
 * Copyright 2021 Esri
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

import {
  ISubscriptionInfo,
  IItemTemplate,
  getSubscriptionInfo,
  replaceInTemplate,
  UserSession,
  getProp
} from "@esri/solution-common";

export function getVelocityUrlBase(
  authentication: UserSession,
  templateDictionary: any
): Promise<string> {
  if (templateDictionary.velocityUrl) {
    return Promise.resolve(templateDictionary.velocityUrl);
  } else {
    return getSubscriptionInfo(undefined, { authentication }).then(
      (subscriptionInfo: ISubscriptionInfo) => {
        let velocityUrl = "";
        const orgCapabilities = subscriptionInfo?.orgCapabilities;
        if (Array.isArray(orgCapabilities)) {
          orgCapabilities.some(c => {
            velocityUrl = c.velocityUrl;
            return velocityUrl;
          });
        }
        // add the base url to the templateDictionary for reuse
        templateDictionary.velocityUrl = velocityUrl;

        return Promise.resolve(velocityUrl);
      }
    );
  }
}

export function getVelocityUrl(
  authentication: UserSession,
  templateDictionary: any,
  type: string,
  id?: string,
  isDeploy: boolean = false,
  urlSuffix: string = "",
  urlPrefix: string = ""
): Promise<string> {
  return getVelocityUrlBase(authentication, templateDictionary).then(url => {
    const _type: string =
      type === "Real Time Analytic"
        ? "analytics/realtime"
        : type === "Big Data Analytic"
        ? "analytics/bigdata"
        : type.toLowerCase();

    const suffix: string = urlSuffix ? `/${urlSuffix}` : "";
    const prefix: string = urlPrefix ? `/${urlPrefix}` : "";

    return Promise.resolve(
      isDeploy
        ? `${url}/iot/${_type}${prefix}${suffix}`
        : id
        ? `${url}/iot/${_type}${prefix}/${id}${suffix}/?f=json&token=${authentication.token}`
        : `${url}/iot/${_type}${prefix}${suffix}/?f=json&token=${authentication.token}`
    );
  });
}

export function getTitle(
  authentication: UserSession,
  label: string,
  url: string
): Promise<string> {
  return _fetch(authentication, `${url}StatusList?view=admin`, "GET").then(
    items => {
      const titles: any[] =
        items && Array.isArray(items)
          ? items.map(item => {
              return { title: item.label };
            })
          : [];
      return Promise.resolve(getUniqueTitle(label, { titles }, "titles"));
    },
    e => Promise.reject(e)
  );
}

export function _validateOutputs(
  authentication: UserSession,
  templateDictionary: any,
  type: string,
  data: any,
  dataOutputs: any[]
): Promise<any> {
  if (dataOutputs.length > 0) {
    return validate(authentication, templateDictionary, type, "", data).then(
      (validateResults: any) => {
        let messages: any[] = getProp(validateResults, "validation.messages");

        const nodes: any[] = getProp(validateResults, "nodes");
        if (nodes && Array.isArray(nodes)) {
          nodes.forEach(node => {
            messages = messages.concat(
              getProp(node, "validation.messages") || []
            );
          });
        }

        let names: string[] = [];
        if (messages && Array.isArray(messages)) {
          messages.forEach(message => {
            // I don't see a way to ask for all output names that exist
            // velocityUrl + /outputs/ just gives you generic defaults not what currently exists
            const nameErrors = [
              "VALIDATION_ANALYTICS__MULTIPLE_CREATE_FEATURE_LAYER_OUTPUTS_REFERENCE_SAME_LAYER_NAME",
              "ITEM_MANAGER__CREATE_ANALYTIC_FAILED_DUPLICATE_OUTPUT_NAMES_IN_ORGANIZATION_NOT_ALLOWED"
            ];
            // The names returned here seem to replace " " with "_" so they do not match exactly
            if (nameErrors.indexOf(message.key) > -1) {
              names = names.concat(message.args);
            }
          });
        }

        if (names.length > 0) {
          _updateDataOutput(dataOutputs, data, names);
          return _validateOutputs(
            authentication,
            templateDictionary,
            type,
            data,
            dataOutputs
          );
        } else {
          return Promise.resolve(data);
        }
      }
    );
  } else {
    return Promise.resolve(data);
  }
}

export function _updateDataOutput(
  dataOutputs: any[],
  data: any,
  names: string[]
) {
  dataOutputs.forEach(dataOutput => {
    const update = _getOutputLabel(names, dataOutput);
    if (update) {
      data.outputs = data.outputs.map((_dataOutput: any) => {
        if (_dataOutput.id === update.id) {
          if (_dataOutput.properties) {
            const nameProp: string = `${_dataOutput.name}.name`;
            if (Object.keys(_dataOutput.properties).indexOf(nameProp) > -1) {
              _dataOutput.properties[nameProp] = update.label;
            }
          }
        }
        return _dataOutput;
      });
    }
  });
}

export function _getOutputLabel(names: any[], dataOutput: any): any {
  const titles: any[] =
    names && Array.isArray(names)
      ? names.map((name: any) => {
          return { title: name };
        })
      : [];

  const label = getUniqueTitle(dataOutput.name, { titles }, "titles");

  return label !== dataOutput.name
    ? {
        label,
        id: dataOutput.id
      }
    : undefined;
}

/**
 * Will return the provided title if it does not exist as a property
 * in one of the objects at the defined path. Otherwise the title will
 * have a numerical value attached.
 *
 * @param title The root title to test
 * @param templateDictionary Hash of the facts
 * @param path to the objects to evaluate for potantial name clashes
 * @return string The unique title to use
 */
export function getUniqueTitle(
  title: string,
  templateDictionary: any,
  path: string
): string {
  title = title ? title.trim() : "_";
  const objs: any[] = getProp(templateDictionary, path) || [];
  const titles: string[] = objs.map(obj => {
    return obj.title;
  });
  let newTitle: string = title;
  let i: number = 0;
  // replace added for velocitcy
  // validation seems to add "_" to names listed in outputs..so  no way to compare without hacking the name
  while (
    titles.indexOf(newTitle) > -1 ||
    titles.indexOf(newTitle.replace(/ /g, "_")) > -1
  ) {
    i++;
    newTitle = title + " " + i;
  }
  return newTitle;
}

export function postVelocityData(
  authentication: UserSession,
  template: IItemTemplate,
  data: any,
  templateDictionary: any,
  autoStart: boolean = false
): Promise<any> {
  return getVelocityUrl(
    authentication,
    templateDictionary,
    template.type,
    undefined,
    true
  ).then(url => {
    return getTitle(authentication, data.label, url).then(
      title => {
        data.label = title;
        data.id = "";
        const body: any = replaceInTemplate(data, templateDictionary);

        const dataOutputs: any[] = (data.outputs || []).map((o: any) => {
          return {
            id: o.id,
            name: o.properties[`${o.name}.name`]
          };
        });

        return _validateOutputs(
          authentication,
          templateDictionary,
          template.type,
          body,
          dataOutputs
        ).then(updatedBody => {
          return _fetch(authentication, url, "POST", updatedBody).then(
            rr => {
              template.item.url = `${url}/${rr.id}`;
              template.item.title = data.label;

              // Update the template dictionary
              templateDictionary[template.itemId]["url"] = template.item.url;
              templateDictionary[template.itemId]["label"] = data.label;
              templateDictionary[template.itemId]["itemId"] = rr.id;

              const finalResult = {
                item: replaceInTemplate(template.item, templateDictionary),
                id: rr.id,
                type: template.type,
                postProcess: false
              };

              if (autoStart) {
                return _validateAndStart(
                  authentication,
                  templateDictionary,
                  template,
                  rr.id
                ).then(() => {
                  return Promise.resolve(finalResult);
                });
              } else {
                return Promise.resolve(finalResult);
              }
            },
            e => Promise.reject(e)
          );
        });
      },
      e => Promise.reject(e)
    );
  });
}

export function _validateAndStart(
  authentication: UserSession,
  templateDictionary: any,
  template: IItemTemplate,
  id: string
): Promise<any> {
  return validate(authentication, templateDictionary, template.type, id).then(
    validateResult => {
      if (validateResult.executable) {
        return start(authentication, templateDictionary, template.type, id);
      } else {
        return Promise.resolve(validateResult);
      }
    }
  );
}

export function getStatus(
  authentication: UserSession,
  templateDictionary: any,
  type: string,
  id: string
): Promise<any> {
  // /iot/feed/{id}/status/
  // /iot/analytics/realtime/{id}/status/
  return getVelocityUrl(
    authentication,
    templateDictionary,
    type,
    id,
    false,
    "status"
  ).then(url => {
    return _fetch(authentication, url, "GET").then(result => {
      console.log(result);
    });
  });
}

export function validate(
  authentication: UserSession,
  templateDictionary: any,
  type: string,
  id: string,
  body?: any
): Promise<any> {
  // /iot/feed/validate/{id}/
  // /iot/analytics/realtime/validate/{id}/
  return getVelocityUrl(
    authentication,
    templateDictionary,
    type,
    id,
    false,
    "",
    "validate"
  ).then(url => {
    return _fetch(authentication, url, "POST", body).then(result => {
      console.log(result);
      return Promise.resolve(result);
    });
  });
}

export function start(
  authentication: UserSession,
  templateDictionary: any,
  type: string,
  id: string
): Promise<any> {
  // /iot/feed/{id}/start/
  // /iot/analytics/realtime/{id}/start/
  return getVelocityUrl(
    authentication,
    templateDictionary,
    type,
    id,
    false,
    "start"
  ).then(url => {
    return _fetch(authentication, url, "GET").then(result => {
      console.log(result);
      return Promise.resolve(result);
    });
  });
}

export function getServices(
  authentication: UserSession,
  templateDictionary: any,
  serviceType: string, // stream or feature
  id: string
): Promise<any> {
  // TODO any value in getting the associated map services as well??

  // /iot/services/
  // /iot/services/stream/
  // /iot/services/feature/
  // /iot/services/map/

  return getVelocityUrl(
    authentication,
    templateDictionary,
    "Services",
    id,
    false,
    "",
    serviceType
  ).then(url => {
    return _fetch(authentication, url, "GET").then(result => {
      console.log(result);
      return Promise.resolve(result);
    });
  });
}

export function getFormats(
  authentication: UserSession,
  templateDictionary: any,
  serviceType: string, // input or output
  id: string
): Promise<any> {
  // /iot/formats/
  // /iot/formats/input/
  // /iot/formats/input/{name}/
  // /iot/formats/output/
  // /iot/formats/output/{name}/
  return getVelocityUrl(
    authentication,
    templateDictionary,
    "Formats",
    id,
    false,
    "",
    serviceType
  ).then(url => {
    return _fetch(authentication, url, "GET").then(result => {
      console.log(result);
      return Promise.resolve(result);
    });
  });
}

export function _getOutputs(
  authentication: UserSession,
  templateDictionary: any,
  serviceType: string, // realtime or bigdata or {name}
  id: string
): Promise<any> {
  // /iot/outputs/
  // /iot/outputs/{name}/
  // /iot/outputs/realtime/
  // /iot/outputs/bigdata/
  return getVelocityUrl(
    authentication,
    templateDictionary,
    "Outputs",
    id,
    false,
    "",
    serviceType
  ).then(url => {
    return _fetch(authentication, url, "GET").then(result => {
      console.log(result);
      return Promise.resolve(result);
    });
  });
}

export function getSources(
  authentication: UserSession,
  templateDictionary: any,
  serviceType: string, // ? {name}
  id: string
): Promise<any> {
  // /iot/sources/
  // /iot/sources/{name}/
  return getVelocityUrl(
    authentication,
    templateDictionary,
    "Sources",
    id,
    false,
    "",
    serviceType
  ).then(url => {
    return _fetch(authentication, url, "GET").then(result => {
      console.log(result);
      return Promise.resolve(result);
    });
  });
}

export function _getRequestOpts(
  authentication: UserSession,
  method: string
): RequestInit {
  return {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "token=" + authentication.token
    },
    method
  };
}

export function _fetch(
  authentication: UserSession,
  url: string,
  method: string, // GET or POST
  body?: any
): Promise<any> {
  const requestOpts: any = _getRequestOpts(authentication, method);
  if (body) {
    requestOpts.body = JSON.stringify(body);
  }
  return fetch(url, requestOpts).then(
    r => Promise.resolve(r.json()),
    e => Promise.reject(e)
  );
}

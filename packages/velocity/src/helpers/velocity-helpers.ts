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
  IItemTemplate,
  getVelocityUrlBase,
  replaceInTemplate,
  UserSession,
  getProp,
  fail
} from "@esri/solution-common";

/**
 * Common function to build urls for reading and interacting with the velocity api
 *
 *
 * @param authentication Credentials for the requests
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param type The type of velocity item we are constructing a url for
 * @param id Optional The id of the velocity item we are constructing a url for
 * @param isDeploy Optional Is this being constructed as a part of deployment
 * @param urlPrefix Optional prefix args necessary for some url construction
 * @param urlSuffix Optional suffix args necessary for some url construction
 *
 * @return a promise that will resolve the constructed url
 *
 */
export function getVelocityUrl(
  authentication: UserSession,
  templateDictionary: any,
  type: string,
  id: string = "",
  isDeploy: boolean = false,
  urlPrefix: string = "",
  urlSuffix: string = ""
): Promise<string> {
  return getVelocityUrlBase(authentication, templateDictionary).then(url => {
    if (url) {
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
    } else {
      return Promise.resolve(url);
    }
  });
}

/**
 * Handles the creation of velocity items.
 *
 * @param authentication Credentials for the requests
 * @param template The current itemTemplate that is being used for deployment
 * @param data The velocity item data used to create the items.
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param autoStart This can be leveraged to start certain velocity items after they are created.
 *
 * @return a promise that will resolve an object containing the item, id, type, and post process flag
 *
 */
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
    if (url) {
      return getTitle(authentication, data.label, url).then(title => {
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
          return _fetch(authentication, url, "POST", updatedBody).then(rr => {
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
          });
        });
      });
    } else {
      return Promise.reject(fail("Velocity NOT Supported by Organization"));
    }
  });
}

/**
 * Velocity item titles must be unique across the organization.
 * Check and ensure we set a unique title
 *
 * @param authentication Credentials for the requests
 * @param label The current label of the item from the solution template
 * @param url The base velocity url for checking status
 *
 * @return a promise that will resolve a unique title
 *
 */
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
    }
  );
}

/**
 * Validate the data that will be used and handle any reported issues with the outputs.
 * The output names must be unique across the organization.
 *
 * This function will update the data arg that is passed in with a unique name.
 *
 * @param authentication Credentials for the requests
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param type The type of velocity item
 * @param data The data used to construct the velocity item
 * @param dataOutputs The velocity items output objects.
 *
 * @return a promise that will resolve the data object passed in with any necessary changes.
 *
 */
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
        /* istanbul ignore else */
        if (nodes && Array.isArray(nodes)) {
          nodes.forEach(node => {
            messages = messages.concat(
              getProp(node, "validation.messages") || []
            );
          });
        }

        let names: string[] = [];
        /* istanbul ignore else */
        if (messages && Array.isArray(messages)) {
          messages.forEach(message => {
            // I don't see a way to ask for all output names that exist
            // velocityUrl + /outputs/ just gives you generic defaults not what currently exists
            const nameErrors = [
              "VALIDATION_ANALYTICS__MULTIPLE_CREATE_FEATURE_LAYER_OUTPUTS_REFERENCE_SAME_LAYER_NAME",
              "ITEM_MANAGER__CREATE_ANALYTIC_FAILED_DUPLICATE_OUTPUT_NAMES_IN_ORGANIZATION_NOT_ALLOWED"
            ];
            // The names returned here seem to replace " " with "_" so they do not match exactly
            /* istanbul ignore else */
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

/**
 * Updates the data object with a new name when validation fails.
 *
 * @param dataOutputs The data output objects from the velocity item.
 * @param data The full data object used for deploying the velocity item.
 * @param names The names that failed due to duplicate error in validation.
 *
 *
 */
export function _updateDataOutput(
  dataOutputs: any[],
  data: any,
  names: string[]
): void {
  dataOutputs.forEach(dataOutput => {
    const update = _getOutputLabel(names, dataOutput);
    /* istanbul ignore else */
    if (update) {
      data.outputs = data.outputs.map((_dataOutput: any) => {
        /* istanbul ignore else */
        if (_dataOutput.id === update.id) {
          /* istanbul ignore else */
          if (_dataOutput.properties) {
            const nameProp: string = `${_dataOutput.name}.name`;
            /* istanbul ignore else */
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

/**
 * Get a unique label for the item.
 *
 * @param names The names that failed due to duplicate error in validation.
 * @param dataOutput The current data output that is being evaluated.
 *
 * @return an object with a unique label and the outputs id when a name
 * conflict is found...otherwise returns undefined
 *
 */
export function _getOutputLabel(names: any[], dataOutput: any): any {
  const titles: any[] = names.map((name: any) => {
    return { title: name };
  });

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
 * This is based on "getUniqueTitle" from common but adds the "_" replacement check for velocity names.
 * Could switch to using common if Velocity has a way to get a list of all names that are already used.
 *
 * @param title The root title to test
 * @param templateDictionary Hash of the facts
 * @param path to the objects to evaluate for potantial name clashes
 *
 * @return string The unique title to use
 *
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

/**
 * Start the item if validation passes and the item is executable.
 *
 * @param authentication Credentials for the requests
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param template the item template that has the details for deployment
 * @param id the new id for the velocity item that was deployed
 *
 * @return a promise that will resolve with the validation results
 * or the start results when validation indicates the item is executable
 *
 */
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

/**
 * Validate the velocity item.
 * Used to help find and handle duplicate name errors.
 *
 * @param authentication Credentials for the requests
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param type The type of velocity item we are constructing a url for
 * @param id? Optional The id of the velocity item we are constructing a url for
 * @param body? Optional the request body to validate.
 *
 * @return a promise that will resolve with an object containing messages
 * indicating any issues found when validating such as name conflict errors
 *
 */
export function validate(
  authentication: UserSession,
  templateDictionary: any,
  type: string,
  id?: string,
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
    "validate",
    ""
  ).then(url => {
    return _fetch(authentication, url, "POST", body).then(result => {
      return Promise.resolve(result);
    });
  });
}

/**
 * Start the given velocity item that has been deployed.
 *
 * @param authentication Credentials for the requests
 * @param templateDictionary Hash of facts: folder id, org URL, adlib replacements
 * @param type The type of velocity item we are constructing a url for
 * @param id? Optional The id of the velocity item we are constructing a url for
 *
 * @return a promise that will resolve with the result of the start call
 *
 */
export function start(
  authentication: UserSession,
  templateDictionary: any,
  type: string,
  id?: string
): Promise<any> {
  // /iot/feed/{id}/start/
  // /iot/analytics/realtime/{id}/start/
  return getVelocityUrl(
    authentication,
    templateDictionary,
    type,
    id,
    false,
    "",
    "start"
  ).then(url => {
    return _fetch(authentication, url, "GET").then(result => {
      return Promise.resolve(result);
    });
  });
}

/**
 * Gets the required request options for requests to the velocity API.
 *
 * @param authentication Credentials for the requests
 * @param method Indicate if "GET" or "POST"
 *
 * @return generic request options used for various calls to velocity api
 *
 */
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

/**
 * Generic fetch function for making calls to the velocity API.
 *
 * @param authentication Credentials for the requests
 * @param url The url from the velocity API to handle reading and writing
 * @param method The method for the request "GET" or "POST"
 * @param body The body for POST requests
 *
 * @return a promise that will resolve with the result of the fetch call
 *
 */
export function _fetch(
  authentication: UserSession,
  url: string,
  method: string, // GET or POST
  body?: any
): Promise<any> {
  const requestOpts: any = _getRequestOpts(authentication, method);
  /* istanbul ignore else */
  if (body) {
    requestOpts.body = JSON.stringify(body);
  }
  return fetch(url, requestOpts).then(r => Promise.resolve(r.json()));
}

/**
 * Remove key properties if the dependency was removed due to having the "IoTFeatureLayer" typeKeyword
 * This function will update the input template.
 *
 * @param template The template that for the velocity item
 *
 */
export function cleanDataSourcesAndFeeds(template: IItemTemplate): void {
  const dependencies: string[] = template.dependencies;

  _removeIdProps(
    getProp(template, "data.sources") ? template.data.sources : [],
    dependencies
  );

  _removeIdProps(
    getProp(template, "data.feeds") ? template.data.feeds : [],
    dependencies
  );

  _removeIdPropsAndSetName(
    getProp(template, "data.outputs") ? template.data.outputs : [],
    dependencies
  );
}

/**
 * Remove key properties from the input source or feed
 *
 * @param sourcesOrFeeds The list of dataSources or feeds
 * @param dependencies The list of dependencies
 *
 */
export function _removeIdProps(
  sourcesOrFeeds: any[],
  dependencies: string[]
): void {
  sourcesOrFeeds.forEach(dataSource => {
    /* istanbul ignore else */
    if (
      dataSource.properties &&
      dataSource.properties["feature-layer.portalItemId"]
    ) {
      const id: string = dataSource.properties["feature-layer.portalItemId"];
      /* istanbul ignore else */
      if (dependencies.indexOf(id) < 0) {
        delete dataSource.properties["feature-layer.portalItemId"];
        delete dataSource.properties["feature-layer.layerId"];
      }
    }
  });
}

/**
 * Remove key properties from the outputs.
 *
 * @param outputs The list of outputs
 * @param dependencies The list of dependencies
 *
 */
export function _removeIdPropsAndSetName(
  outputs: any[],
  dependencies: string[]
): void {
  outputs.forEach(output => {
    /* istanbul ignore else */
    if (output.properties) {
      _removeProp(
        output.properties,
        "feat-lyr-new.portal.featureServicePortalItemID",
        dependencies
      );
      _removeProp(
        output.properties,
        "feat-lyr-new.portal.mapServicePortalItemID",
        dependencies
      );
      _updateName(output.properties);
    }
  });
}

/**
 * Generic helper function to remove key properties .
 *
 * @param props the list of props to update
 * @param prop the individual prop to remove
 * @param dependencies The list of dependencies
 *
 */
export function _removeProp(
  props: any,
  prop: string,
  dependencies: string[]
): void {
  const id: string = props[prop];
  /* istanbul ignore else */
  if (id && dependencies.indexOf(id) < 0) {
    delete props[prop];
  }
}

/**
 * Update the feature layer name to include the solution item id.
 *
 * @param props the list of props to update
 *
 */
export function _updateName(props: any): void {
  const name: string = props["feat-lyr-new.name"];
  /* istanbul ignore else */
  if (name && name.indexOf("{{solutionItemId}}") < 0) {
    props["feat-lyr-new.name"] = `${name}_{{solutionItemId}}`;
  }
}

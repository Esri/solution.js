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

import { IUserRequestOptions } from "@esri/arcgis-rest-auth";

import * as mCommon from "./common";
import { ITemplate } from "../interfaces";

// -- Externals ------------------------------------------------------------------------------------------------------//

// -- Create Bundle Process ------------------------------------------------------------------------------------------//

export function completeItemTemplate (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise(resolve => {
    // Common templatizations: extent, item id, item dependency ids
    mCommon.doCommonTemplatizations(itemTemplate);

    resolve(itemTemplate);
  });
}

export function getDependencyIds (
  itemTemplate: ITemplate,
  requestOptions?: IUserRequestOptions
): Promise<string[]> {
  return new Promise(resolve => {
    resolve([]);
  });
}

// -- Deploy Bundle Process ------------------------------------------------------------------------------------------//

export function deployItem (
  itemTemplate: ITemplate,
  folderId: string,
  settings: any,
  requestOptions: IUserRequestOptions
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    resolve(itemTemplate);
  });
}

export function interpolateTemplate (
  itemTemplate: ITemplate,
  replacements: any
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    resolve(itemTemplate);// //???
  });
}

export function handlePrecreateLogic (
  itemTemplate: ITemplate
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    resolve(itemTemplate);// //???
  });
}

export function createItem (
  itemTemplate: ITemplate
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    resolve(itemTemplate);// //???
  });
}

export function handlePostcreateLogic (
  itemTemplate: ITemplate
): Promise<ITemplate> {
  return new Promise((resolve, reject) => {
    resolve(itemTemplate);// //???
  });
}


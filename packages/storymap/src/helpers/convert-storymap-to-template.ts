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

import {
  IModel,
  cloneObject,
  propifyString,
  createId,
  normalizeSolutionTemplateItem,
  deepStringReplace
} from "@esri/hub-common";
import { IItem } from "@esri/arcgis-rest-portal";
import {
  IItemTemplate,
  createPlaceholderTemplate
} from "@esri/solution-common";
import { remapWebmapKeys } from "./remap-webmap-keys";
import { getStoryMapDependencies } from "./get-storymap-dependencies";

/**
 * Convert a StoryMap IModel to an IItemTemplate
 *
 * @param model
 * @param authentication
 */
export function convertStoryMapToTemplate(
  model: IModel
): Promise<IItemTemplate> {
  const tmpl = createPlaceholderTemplate(model.item.id, model.item.type);
  tmpl.key = `${propifyString(model.item.title)}_${createId("i")}`;

  const clone = cloneObject(model);
  tmpl.data = clone.data;
  tmpl.item = normalizeSolutionTemplateItem(clone.item) as IItem;
  // templatize the url
  tmpl.item.url = "{{storyMapTemplateUrl}}";

  // Storymap Webmap Resources have complex keys that we need to remap
  const webmapRemaps = remapWebmapKeys(tmpl.data.resources);
  // and then replace in the rest of the structure
  webmapRemaps.forEach(remap => {
    tmpl.data.resources[remap.updated] = cloneObject(
      tmpl.data.resources[remap.original]
    );
    delete tmpl.data.resources[remap.original];
    tmpl.data.nodes = deepStringReplace(
      tmpl.data.nodes,
      remap.original,
      remap.updated
    );
  });

  // use typeKeyword to mark item as published
  // Note: Hub team decided to discard unpublished drafts when creating a template
  const typeKeywords = tmpl.item.typeKeywords;
  if (typeKeywords.indexOf(unPublishedChangesKW) !== -1) {
    tmpl.item.typeKeywords = [publishedChangesKW].concat(
      tmpl.item.typeKeywords.filter(
        (word: string) => word !== unPublishedChangesKW
      )
    );
  }

  tmpl.properties = {};
  tmpl.properties.draftFileName = "draft_{{timestamp}}.json";
  Object.assign(tmpl.properties, oEmbedTemplates);

  tmpl.dependencies = getStoryMapDependencies(model);

  return Promise.resolve(tmpl);
  // TODO: For now, we let the generic process handle item resources
  // However, many newer item types have complex type-specific resource handling
  // requirements so this code may be useful in the future
  // ------------------------------------------------------
  // return getItemResources(tmpl.itemId, hubRequestOptions)
  //   .then((response) => {
  //     tmpl.resources = response.resources.map(e => e.resource)
  //       // Don't directly copy oembed resources because we need to template these
  //       // Also, discard draft version of the storymap itself
  //       .filter(filename => !filename.includes('oembed') && filename.search(/draft_[0-9]+.json/) === -1);
  //     return tmpl;
  //   });
}

// Internal constants
const unPublishedChangesKW = "smstatusunpublishedchanges";
const publishedChangesKW = "smstatuspublished";

/**
 * Template for oEmbed
 */
const oEmbedTemplates = {
  oembed: {
    version: "1.0",
    type: "rich",
    title: "Example StoryMap",
    url: "{{storyMapTemplateUrl}}",
    provider_name: "ArcGIS StoryMaps",
    provider_url: "{{storyMapBaseUrl}}",
    width: 800,
    height: 600,
    thumbnail_url: "{{storyMapThumbnailUrl}}",
    thumbnail_height: "100.5",
    thumbnail_width: "400",
    html:
      '<iframe src="{{storyMapTemplateUrl}}" width="800" height="600" scrolling="yes" frameborder="0" allowfullscreen></iframe>',
    cache_age: 86400
  },
  oembedXML:
    '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n <oembed>\n <version>1.0</version>\n <type>rich</type>\n <title>Example StoryMap</title>\n <url>{{storyMapTemplateUrl}}</url>\n <author_name>undefined</author_name>\n <provider_name>ArcGIS StoryMaps</provider_name>\n <provider_url>{{storyMapBaseUrl}}</provider_url>\n <width>800</width>\n <height>600</height>\n <thumbnail_url>{{storyMapThumbnailUrl}}</thumbnail_url>\n <thumbnail_height>100.5</thumbnail_height>\n <thumbnail_width>400</thumbnail_width>\n <html><iframe src="{{storyMapTemplateUrl}}" width="800" height="600" scrolling="yes" frameborder="0" allowfullscreen="true"></iframe></html>\n <cache_age>86400</cache_age>\n </oembed>'
};

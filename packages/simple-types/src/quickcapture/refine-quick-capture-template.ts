import {
  IItemTemplate,
  getBlobText,
  getProp,
  setProp,
  templatizeTerm,
  IQuickCaptureDatasource
} from "@esri/solution-common";
import { addDependencyIfNotPresent } from "../helpers/add-dependency-if-not-present";

/**
 * Refine an quick capture template.
 *
 * @param itemTemplate template for the quick capture project item
 * @return templatized itemTemplate
 */
export function refineQuickCaptureTemplate(
  itemTemplate: IItemTemplate
): Promise<IItemTemplate> {
  return new Promise<IItemTemplate>((resolve, reject) => {
    // The templates data to process
    const data: any = itemTemplate.data;
    if (data && Array.isArray(data)) {
      let applicationRequest: Promise<any> = Promise.resolve();
      let applicationName: string = "";
      data.some((item: File) => {
        if (item.type === "application/json") {
          applicationName = item.name;
          applicationRequest = getBlobText(item);
          return true;
        }
      });

      applicationRequest.then(result => {
        // replace the template data array with the templatized application JSON
        itemTemplate.data = result
          ? {
              application: _templatizeApplication(
                JSON.parse(result),
                itemTemplate
              ),
              name: applicationName
            }
          : {};
        resolve(itemTemplate);
      }, reject);
    } else {
      resolve(itemTemplate);
    }
  });
}

/**
 * Templatizes key properties for a quick capture project and gathers item dependencies
 *
 * @param data the projects json
 * @param itemTemplate template for the quick capture project item
 * @return templatized itemTemplate
 * @private
 */
export function _templatizeApplication(
  data: any,
  itemTemplate: IItemTemplate
): any {
  // Quick Project item id
  _templatizeId(data, "itemId");

  // Set the admin email
  _templatizeAdminEmail(data);

  // datasource item id and url
  const dataSources: IQuickCaptureDatasource[] = data.dataSources;
  if (dataSources && Array.isArray(dataSources)) {
    dataSources.forEach(ds => {
      const id: string = ds.featureServiceItemId;
      if (id) {
        addDependencyIfNotPresent(id, itemTemplate);
        _templatizeUrl(ds, "featureServiceItemId", "url");
        _templatizeId(ds, "featureServiceItemId");
      }
    });
  }
  return data;
}

/**
 * Templatize the email property
 *
 * @param data the quick capture application
 * @private
 */
export function _templatizeAdminEmail(data: any): void {
  if (getProp(data, "preferences.adminEmail")) {
    setProp(data, "preferences.adminEmail", "{{user.email}}");
  }
}

/**
 * Templatize the item id property
 *
 * @param obj the datasource or object that contains the item id property
 * @param path the path to the id property
 */
export function _templatizeId(obj: any, path: string): void {
  const id: any = getProp(obj, path);
  if (id) {
    setProp(obj, path, templatizeTerm(id, id, ".itemId"));
  }
}

/**
 * Templatize a url property
 *
 * @param obj the datasource object
 * @param idPath the path to the id property
 * @param urlPath the path to the url property
 * @private
 */
export function _templatizeUrl(
  obj: any,
  idPath: string,
  urlPath: string
): void {
  const id: any = getProp(obj, idPath);
  const url: string = getProp(obj, urlPath);
  if (url) {
    const layerId = url.substr(url.lastIndexOf("/") + 1);
    setProp(obj, urlPath, templatizeTerm(id, id, ".layer" + layerId + ".url"));
  }
}

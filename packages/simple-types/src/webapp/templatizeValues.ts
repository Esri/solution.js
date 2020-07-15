import {
  IItemTemplate,
  SERVER_NAME,
  placeholder,
  setProp,
  fail
} from "@esri/solution-common";
import { UserSession } from "@esri/solution-common";
import { getProp } from "@esri/hub-common";
import { setValues } from "./setValues";
import { findUrls } from "./findUrls";
import { handleServiceRequests } from "./handleServiceRequests";
/**
 *
 * @param itemTemplate
 * @param authentication
 * @param portalUrl
 * @param widgetPath
 * @private
 */

export function templatizeValues(
  itemTemplate: IItemTemplate,
  authentication: UserSession,
  portalUrl: string,
  widgetPath: string
): Promise<IItemTemplate> {
  return new Promise<IItemTemplate>((resolve, reject) => {
    // update properties of values collection for web app templates
    let values: any = getProp(itemTemplate, widgetPath);
    let serviceRequests: any[] = [];
    let requestUrls: string[] = [];

    if (values) {
      if (getProp(values, "icon")) {
        setValues(values, ["icon"], placeholder(SERVER_NAME));
      }

      const sConfig: string = JSON.stringify(values);
      const urlResults: any = findUrls(
        sConfig,
        portalUrl,
        requestUrls,
        serviceRequests,
        authentication
      );

      values = JSON.parse(urlResults.testString);
      serviceRequests = urlResults.serviceRequests;
      requestUrls = urlResults.requestUrls;
    }

    if (serviceRequests.length > 0) {
      const sWidgets: string = JSON.stringify(values);
      handleServiceRequests(serviceRequests, requestUrls, sWidgets).then(
        response => {
          setProp(itemTemplate, widgetPath, JSON.parse(response));
          resolve(itemTemplate);
        },
        e => reject(fail(e))
      );
    } else {
      resolve(itemTemplate);
    }
  });
}

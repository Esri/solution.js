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

export function templatizeWidgets(
  itemTemplate: IItemTemplate,
  authentication: UserSession,
  portalUrl: string,
  widgetPath: string
): Promise<IItemTemplate> {
  return new Promise<IItemTemplate>((resolve, reject) => {
    // update widgets
    const widgets: any[] = getProp(itemTemplate, widgetPath) || [];
    let serviceRequests: any[] = [];
    let requestUrls: string[] = [];

    widgets.forEach(widget => {
      if (getProp(widget, "icon")) {
        setValues(widget, ["icon"], placeholder(SERVER_NAME));
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

    if (serviceRequests.length > 0) {
      const sWidgets: string = JSON.stringify(widgets);
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

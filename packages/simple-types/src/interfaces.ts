/**
 * The relevant elements of a dashboards dataset
 * @protected
 */
export interface IDashboardDataset {
  /**
   * These can be relative references to layers in map a map widget or external datasources
   */
  dataSource: IDashboardDatasource;
  /**
   * Dashboard dataset type...we are only concerend with service datasets
   */
  type: string;
}

/**
 * The relevant datasource properties that describe a dataset
 * @protected
 */
interface IDashboardDatasource {
  /**
   * When it's an external datasource it will contain the portal itemId
   * as well as the individual layerId
   */
  itemId?: string;
  layerId?: any;
  /**
   * When it's a datasource from a map widget it will contain a reltive path
   * DashboardMapId#OperationalLayerId
   * For example: b38e032d-bf0c-426f-8036-b86341eb3693#TestLayerForDashBoardMap_632
   */
  id?: string;
}

/**
 * The relevant elements of a Dashboard widget.
 * @protected
 */
export interface IDashboardWidget {
  /**
   * AGOL item id for some widget types
   */
  itemId: string;
  /**
   * Dashboard widget type
   */
  type: string;
  /**
   * Dashboard widget datasets if any
   * These can be relative references to layers in map a map widget or external datasources
   */
  datasets?: IDashboardDataset[];
}

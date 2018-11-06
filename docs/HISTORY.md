## Use Cases and Target Audience

This API intends to simplify the creation and cloning of ArcGIS Solutions and Initiatives in both Node.js and browsers. This library supports downstream projects like the ArcGIS Solutions website and ArcGIS Hub.

## Functionality Roadmap

* Create Solutions and Initiative AGOL items
	* Extract JSON forms of items forming a Solution or Initiative and package them into the Solution or Initiative
* Provide convenience functions for reading the Solution or Initiative, such as its item hierarchy or dependency order
* Clone a Solution or Initiative into a group in an AGOL organization
* Be compatible with Node 6+ and the two latest releases of the Chrome, Safari, Firefox, and Edge browsers as well as IE 11. (Browsers selected by [USA browser market share](http://gs.statcounter.com/browser-market-share/all/united-states-of-america).)

## Project Architecture

As with any new JavaScript project there are numerous decisions to make regarding which technologies to use. We decided to go with the options below, but all these choices are up for debate.

* Author the library in [TypeScript](https://www.typescriptlang.org/). Using TypeScript will allow us to add type information to request params and response structures which vastly simplifies development. TypeScript also has excellent support for newer `async`/`await` patterns with miminal code overhead and can publish to any module format we might need to support. Additionally TypeScript has excellent support for generating API documentation with [TypeDoc](http://typedoc.org/). TypeScript also has better internal adoption since Dojo 2 is using it as well as the JSAPI, Insights, and the ArcGIS for Developers site.
* Build upon [arcgis-rest-js](https://github.com/Esri/arcgis-rest-js) and attempt to be architecturally compatible with it.
* Use a functional form following the Hub lead as described in [Why Not Objects?](https://github.com/esri/hub.js#why-not-objects)
* Use Jasmine and the Jasmine CLI for Node tests.

It is worth noting that a TypeScript/Intern approach aligns perfectly with the direction of the JavaScript API team.

### Modules

* **solution**
	* `createSolution()`: Converts one or more AGOL items and their dependencies into a hash by id of generic JSON item descriptions.
	* `publishSolution()`: Creates a Solution item containing JSON descriptions of items forming the solution.
	* `cloneSolution()`: Converts a hash by id of generic JSON item descriptions into AGOL items.
* **fullItem**
	* `getFullItem()`: Fetches the item, data, and resources of an AGOL item.
* **fullItemHierarchy**
	* `getFullItemHierarchy()`: Converts one or more AGOL items and their dependencies into a hash by id of JSON item descriptions.
* **dependencies**
	* `getDependencies()`: Gets the ids of the dependencies of an AGOL item.
	* `swizzleDependencies()`: Swizzles the dependencies of an AGOL item.
* **viewing**
	* `getItemHierarchy()`: Extracts item hierarchy structure from a Solution's items list

### Solution item data packet

The Solution item contains a single property--`items`--that is a hash by AGOL id of the items in the solution. Hashes use the ids of the Solution's source items; these ids are swizzled into new ids when the solution is cloned.

Each item contains

* `type`: its AGOL item type string; for groups, "Group" is used
* `dependencies`: a list of AGOL item ids that the item depends upon
* `item`: the JSON structure that every AGOL item and group has as its basic information (e.g., what is returned by http://www.arcgis.com/sharing/content/items/6fc5992522d34f26b2210d17835eea21?f=json)

Some items also contain

* `data`: the JSON structure holding additional data for the item (e.g., what is returned by http://www.arcgis.com/sharing/content/items/6fc5992522d34f26b2210d17835eea21/data?f=json)

A property named `estimatedCost` may be present. It is a number indicating the approximate relative cost of cloning the item; for example, a web map has an estimated cost of 1, while a web mapping app has an estimated cost of 2 because it requires an extra server call to update its URL; feature services and their layers are particularly slow and have an increased cost estimate as a result.

The Solution does not contain explicit information about its hierarchy or the order in which items need to be created to satisfy dependencies because these can be quickly generated on the fly.

Example Solution data packet: [exampleSolutionItem.json](https://github.com/ArcGIS/arcgis-clone-js/blob/master/docs/exampleSolutionItem.json). It contains three independent apps and their dependencies; hierarchies of dependencies are shown via indentation:

1. ROW Permit Dashboard (Dashboard)
	* ROW Permit Dashboard (Webmap)
		* ROWPermits_dashboard (Feature Service)
2. ROW Permit Manager (Web Mapping Application)
	* ROW Permit Manager (Group)
		* ROW Permit Manager (Webmap)
			* ROWPermits_manager (Feature Service)
3. ROW Permit Public Comment (Web Mapping Application)
	* ROW Permit Public Comment (Webmap)
		* ROWPermits_publiccomment (Feature Service)

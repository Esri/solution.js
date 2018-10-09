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
* Use a hierarchy of classes to represent the different AGOL item types to take advantage of polymorphism.
* Use Jasmine and the Jasmine CLI for Node tests.

It is worth noting that a TypeScript/Intern approach aligns perfectly with the direction of the JavaScript API team.

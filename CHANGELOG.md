Version 6 marks the use of ArcGIS Rest JS 4x within Solution JS.  Previous versions leveraged ArcGIS Rest JS 3x.

RELEASES

v6.0.2-alpha.0
  Switch ArcGIS Rest JS to 4.x.
  
v5.8.*
  Move web tool to solution folder for ArcGIS Enterprise.
  Portal check for subtypes and contingent values and add indexes logic.
  Ability to create a new template from an existing deployed Solution.
  Added support for not creating solution item during deployment.

v5.6.*
  Enhanced constraints for creating zips for uploading resources.
  Consolidated all ArcGIS Rest JS imports into a single file.

v5.3.*
  Add support for Web Tool.

Versions not denoted constitutes minor bug fixes and/or dependency package updates.

KNOWN APP DEPENDENCY CHANGES

These are ESRI maintained apps that leverages Solution JS for finer grain changes which may have impact.
HUB

v6.0.2-alpha.0
  solution-common
    copyResource
    migrateSchema
  solution-deployer
    deploySolution
    isSolutionTemplateItem
  solution-creator
    createSolution

  

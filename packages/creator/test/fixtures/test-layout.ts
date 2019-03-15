// Layout json
export default {
  sections: [
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: false,
          isUrl: true,
          state: "valid",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "transparent",
          image:
            "https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/city-skyline.jpg"
        },
        color: "#ffffff"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "jumbotron-card",
                settings: {
                  header: "Layout Templating",
                  subheader: "Test Site for Converting to Templates",
                  minHeight: "150",
                  showLocation: false,
                  imageUrl: "",
                  fileSrc: "",
                  cropSrc: "",
                  isUrl: true,
                  isFile: false,
                  state: "",
                  position: {
                    x: "center",
                    y: "center"
                  },
                  display: {},
                  showSearch: false
                }
              },
              width: 12
            }
          ]
        }
      ]
    },
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: false,
          isUrl: true,
          state: "",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "#292b47",
          image: ""
        },
        color: "#ffffff"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown:
                    '<p class="lead text-justify">This is the platform for exploring and downloading GIS data, discovering and building apps, and engaging others to solve important issues. You can analyze and combine datasets using maps, as well as develop new web and mobile applications. Let\'s achieve our goals together</p>'
                }
              },
              width: 12,
              showEditor: false
            }
          ]
        }
      ]
    },
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: true,
          isUrl: false,
          state: "valid",
          display: {
            crop: {
              transformAxis: "x",
              position: {
                x: 0,
                y: 0
              },
              scale: {
                current: 0,
                original: 0
              },
              container: {
                left: 20,
                top: 138,
                width: 860,
                height: 463.419689119171
              },
              natural: {
                width: 772,
                height: 416
              },
              output: {
                width: 820,
                height: 250.41968911917098
              },
              version: 2,
              rendered: {
                width: 860,
                height: 463.419689119171
              }
            }
          },
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "transparent",
          fileSrc: "udemy-avatar.jpg",
          cropSrc: "hub-image-card-crop-i82b07y2e.png",
          cropId: "i82b07y2e"
        },
        color: "#ff0000"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "follow-initiative-card",
                settings: {
                  initiativeId: "c5963a6bb6244eb8b8fb4f56cb0bef4c",
                  callToActionText:
                    "By following this initiative you will get updates about new events, surveys, and tools that you can use to help us achieve our goals.",
                  callToActionAlign: "center",
                  buttonText: "Follow",
                  buttonAlign: "center",
                  buttonStyle: "outline",
                  unfollowButtonText: "Unfollow"
                }
              },
              width: 12
            }
          ]
        },
        {
          cards: [
            {
              component: {
                name: "items/gallery-card",
                settings: {
                  query: {
                    mode: "dynamic",
                    num: 4,
                    types: ["dataset"],
                    tags: [],
                    groups: [
                      {
                        title: "Maryland Socrata LALALAL",
                        id: "9db8bf78132c44ae83131fd879c87881"
                      }
                    ],
                    ids: []
                  },
                  display: {
                    imageType: "Icons",
                    viewText: "Explore",
                    dropShadow: "medium",
                    cornerStyle: "round"
                  },
                  version: 2,
                  orgId: "97KLIFOSt5CxbiRI",
                  siteId: ""
                }
              },
              width: 12
            }
          ]
        },
        {
          cards: [
            {
              component: {
                name: "event-list-card",
                settings: {
                  calendarEnabled: true,
                  defaultView: "calendar",
                  eventListTitleAlign: "left",
                  height: 500,
                  listEnabled: true,
                  showTitle: true,
                  title: "List of Upcoming Events",
                  initiativeIds: ["c5963a6bb6244eb8b8fb4f56cb0bef4c"]
                }
              },
              width: 12
            }
          ]
        },
        {
          cards: [
            {
              component: {
                name: "jumbotron-card",
                settings: {
                  header: "Find Data",
                  subheader: "",
                  minHeight: "50",
                  showLocation: false,
                  imageUrl: "",
                  fileSrc: "",
                  cropSrc: "",
                  isUrl: true,
                  isFile: false,
                  state: "",
                  position: {
                    x: "center",
                    y: "center"
                  },
                  display: {},
                  showSearch: true,
                  searchPlaceholder: "Search for Data"
                }
              },
              width: 12
            }
          ]
        }
      ]
    },
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: false,
          isUrl: true,
          state: "",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "#ffffff"
        },
        color: "#808080"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown: '<h2 class="text-center">Explore your data</h2>'
                }
              },
              width: 12,
              showEditor: false
            }
          ]
        },
        {
          cards: [
            {
              component: {
                name: "category-card",
                settings: {
                  category: "Agriculture",
                  type: "keyword",
                  keyword: "agriculture",
                  iconName: "environment",
                  iconType: "library",
                  customAltText: "",
                  iconColor: "#008000"
                }
              },
              width: 3
            },
            {
              component: {
                name: "category-card",
                settings: {
                  category: "Boundaries",
                  type: "keyword",
                  keyword: "boundaries",
                  iconName: "boundaries",
                  iconType: "library",
                  customAltText: "",
                  iconColor: "#ffa500"
                }
              },
              width: 3
            },
            {
              component: {
                name: "category-card",
                settings: {
                  category: "Business",
                  type: "keyword",
                  keyword: "business",
                  iconName: "structure",
                  iconType: "library",
                  customAltText: "",
                  iconColor: "#136fbf"
                }
              },
              width: 3
            },
            {
              component: {
                name: "category-card",
                settings: {
                  category: "Community Safety",
                  type: "keyword",
                  keyword: "safety",
                  iconName: "mapproducts",
                  iconType: "library",
                  customAltText: "",
                  iconColor: "#ffd700"
                }
              },
              width: 3
            }
          ]
        },
        {
          cards: [
            {
              component: {
                name: "category-card",
                settings: {
                  category: " Education",
                  type: "keyword",
                  keyword: "education",
                  iconName: "historic",
                  iconType: "library",
                  customAltText: "",
                  iconColor: "#4b0082"
                }
              },
              width: 3
            },
            {
              component: {
                name: "category-card",
                settings: {
                  category: "Health",
                  type: "keyword",
                  keyword: "health",
                  iconName: "health",
                  iconType: "library",
                  customAltText: "",
                  iconColor: "#008080"
                }
              },
              width: 3
            },
            {
              component: {
                name: "category-card",
                settings: {
                  category: "Housing",
                  type: "keyword",
                  keyword: "housing",
                  iconName: "locationaddress",
                  iconType: "library",
                  customAltText: "",
                  iconColor: "#808080"
                }
              },
              width: 3
            },
            {
              component: {
                name: "category-card",
                settings: {
                  category: "Transportation",
                  type: "keyword",
                  keyword: "transportation",
                  iconName: "transportation",
                  iconType: "library",
                  customAltText: "",
                  iconColor: "#000000"
                }
              },
              width: 3
            }
          ]
        }
      ]
    },
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: false,
          isUrl: true,
          state: "",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "transparent"
        },
        color: "#4c4c4c"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown:
                    '<h2 class="text-center"> Applications</h2>\n\n<div class="col-xs-12"><p class="text-left">Apps provide simple access to information and tools for you to collect data and help your users understand your data. We recommend exploring the apps below for helping engage around specific goals and initiatives. Try updating the below cards or use the Gallery Card in the site editor</p><br /></div>\n\n<div class="col-xs-12 col-sm-6 col-md-3">\n<div class="calcite-web">\n  <div class="card-base">\n    <div class="card-image-wrap">\n      <img class="card-image" src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/app-proximity.jpg" alt="Local Perspective Map View">\n    </div>\n    <div class="card-content">\n      <h4><a href="http://www.arcgis.com/home/item.html?id=6e02b538bea841ed858ef9f52709b655">Local Perspective</a></h4>\n      <p style="min-height: 50px">Configure apps to provide focused citizen experiences.</p>\n      <div aria-label="actions" class="btn-group btn-group-justified" role="group">\n        <a class="btn btn-default" href="#">Details</a><a class="btn btn-primary" href="#">View</a>\n      </div>\n    </div>\n  </div>\n</div>\n</div>\n\n<div class="col-xs-12 col-sm-6 col-md-3">\n<div class="calcite-web">\n  <div class="card-base">\n    <div class="card-image-wrap">\n      <img class="card-image" src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/story-map-editor.jpg" alt="Story Maps Cascade">\n    </div>\n    <div class="card-content">\n      <h4><a href="https://storymaps.arcgis.com">Story Maps</a></h4>\n      <p style="min-height: 50px">Tell stories about local issues and solutions.</p>\n      <div aria-label="actions" class="btn-group btn-group-justified" role="group">\n        <a class="btn btn-default" href="#">Details</a><a class="btn btn-primary" href="#">View</a>\n      </div>\n    </div>\n  </div>\n</div>\n</div>\n\n<div class="clearfix visible-sm-block"></div>\n\n<div class="col-xs-12 col-sm-6 col-md-3">\n<div class="calcite-web">\n  <div class="card-base">\n    <div class="card-image-wrap">\n      <img class="card-image" src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/mobile-app.jpg" alt="Survey123 Mobile View">\n    </div>\n    <div class="card-content">\n      <h4><a href="https://survey123.arcgis.com/">Survey 123</a></h4>\n      <p  style="min-height: 50px">Hear from your community.</p>\n      <div aria-label="actions" class="btn-group btn-group-justified" role="group">\n        <a class="btn btn-default" href="#">Details</a><a class="btn btn-primary" href="#">View</a>\n      </div>\n    </div>\n  </div>\n</div>\n</div>\n\n\n<div class="col-xs-12 col-sm-6 col-md-3">\n<div class="calcite-web">\n  <div class="card-base">\n    <div class="card-image-wrap">\n      <img class="card-image" src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/ops-dashboard.jpg" alt="Ops Dashboard">\n    </div>\n    <div class="card-content">\n      <h4><a href="http://hub.arcgis.com/pages/open-data">Ops Dashboard</a></h4>\n      <p  style="min-height: 50px">Monitor your data</p>\n      <div aria-label="actions" class="btn-group btn-group-justified" role="group">\n        <a class="btn btn-default" href="#">Details</a><a class="btn btn-primary" href="#">View</a>\n      </div>\n    </div>\n  </div>\n</div>\n</div>\n<div class="col-xs-12">\n<p class="text-right"><a href="http://solutions.arcgis.com" class="btn btn-primary">Explore More Apps</a></p>\n</div>'
                }
              },
              width: 12,
              showEditor: false
            }
          ]
        }
      ]
    },
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: false,
          isUrl: true,
          state: "valid",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "transparent",
          image:
            "https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/blue-map-banner.jpg"
        },
        color: "#ffffff"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown:
                    '<h2 class="text-center">Unlock the Data</h2>\n<p class="text-center">Anyone can use this data at no cost. Download raw data and share your insights with your teams or build new applications that serve specific users.</p>\n\n<div class="row">\n<div class="col-xs-12 col-sm-6 col-md-3">\n<div class="p p-default">\n<div class="p-heading"><center><img src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/explore.png" /></center></div>\n<div class="p-body">\n<h3 class="text-center">Explore</h3>\n<p class="text-center">Dig into the data.</p>\n</div></div>\n</div>\n<div class="col-xs-12 col-sm-6 col-md-3">\n<div class="p p-default">\n<div class="p-heading"><center><img src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/visualize.png" /></center></div>\n<div class="p-body">\n<h3 class="text-center">Visualize & Analyze</h3>\n<p class="text-center">Highlight spatial patterns and discover trends.</p>\n</div></div>\n</div>\n<div class="col-xs-12 col-sm-6 col-md-3">\n<div class="p p-default">\n<div class="p-heading"><center><img src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/build.png" /></center></div>\n<div class="p-body">\n<h3 class="text-center">Build</h3>\n<p class="text-center">Develop new apps using templates and API\'s.</p>\n</div></div>\n</div>\n<div class="col-xs-12 col-sm-6 col-md-3">\n<div class="p p-default">\n<div class="p-heading"><center><img src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/share.png" /></center></div>\n<div class="p-body">\n<h3 class="text-center">Share</h3>\n<p class="text-center">Embed analysis on your website.</p>\n</div></div>\n</div>\n</div>'
                }
              },
              width: 12,
              showEditor: false
            }
          ]
        }
      ]
    },
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: false,
          isUrl: true,
          state: "",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "transparent"
        },
        color: "#4c4c4c"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown:
                    '## Data Narratives \n \n<p class="lead">Datasets have a story to tell. Engage and inspire your audience by combining text, images, and other multimedia content with maps. You have the local knowledge and expertise, now begin and sustain a meaningful connection with your users.</p>\n\n<p class="text-center">[Learn More](http://storymaps.arcgis.com/en/)</p>'
                }
              },
              width: 9,
              showEditor: false
            },
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown:
                    '<div class="calcite-web">\n  <div class="card-base">\n    <div class="card-image-wrap">\n      <img class="card-image" src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/story-map-editor.jpg" alt="Story Maps Cascade">\n    </div>\n    <div class="card-content">\n      <h4><a href="https://storymaps.arcgis.com">Story Maps</a></h4>\n      <p>Share local knowledge and insights.</p>\n   <a class="btn btn-primary" href="#">View</a>\n    </div>\n  </div>\n</div>'
                }
              },
              width: 3,
              showEditor: false
            }
          ]
        }
      ]
    },
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: false,
          isUrl: true,
          state: "",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "#e9f5f8",
          image: ""
        },
        color: "#4c4c4c"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown:
                    '<div class="calcite-web">\n  <div class="card-base">\n    <div class="card-image-wrap">\n      <img class="card-image" src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/people.jpg" alt="Developers">\n    </div>\n    <div class="card-content">\n      <h4><a href="https://developers.arcgis.com">ArcGIS Online for Developers</a></h4>\n      <p>Develop new apps and solutions for your community.</p>\n   <a class="btn btn-primary" href="#">View</a>\n    </div>\n  </div>\n</div>'
                }
              },
              width: 3,
              showEditor: false
            },
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown:
                    '## Connect to your data\'s API\n \n<p class="lead">Use this platform to spur innovation from other teams and stay on top of the latest technology. Utilizing open standards, interoperability, data, APIs, and code can connect you directly your data\'s community.</a>\n\n<p class="text-center"><a href="http://www.esri.com/software/open">Vision</a> | <a href="http://developers.arcgis.com">Developer API</a></p>'
                }
              },
              width: 9,
              showEditor: false
            }
          ]
        }
      ]
    },
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: false,
          isUrl: true,
          state: "",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "transparent"
        },
        color: "#4C4C4C"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown:
                    "## Cross-Functional Events\n\nData is best used in coordination between multiple departments and groups. By hosting in-person events you can share knowledge and build a cohesive collaboration to solve your more important initiatives. It is often helpful to have regular and on-going events that align with existing local community events when possible. \n\nExamples:\n- [GeoDev Meetup](http://www.esri.com/events/geodev-meetups) on visualization\n- Transportation Data Meetup, hosted by DOT\n- Public Safety and You, hosted by PD\n- Community App Challenge, hosted by Mayor's office\n- [ConnectEd](http://www.esri.com/connected) event with local Schools"
                }
              },
              width: 6,
              showEditor: false
            },
            {
              component: {
                name: "image-card",
                settings: {
                  src:
                    "https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/meeting.jpg",
                  fileSrc: "",
                  cropSrc: "",
                  alt: "Community Hackathon - Flickr: ajturner",
                  caption: "Data working session",
                  captionAlign: "center",
                  hyperlink: "",
                  hyperlinkTabOption: "new",
                  isUrl: true,
                  isFile: false,
                  state: "valid",
                  display: {
                    position: {
                      x: "center",
                      y: "center"
                    },
                    reflow: false
                  }
                }
              },
              width: 6
            }
          ]
        }
      ]
    },
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: false,
          isUrl: true,
          state: "",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "#dedede",
          image: ""
        },
        color: "#757575"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown:
                    '<h2 class="text-center">Contact Information</h2>\n<h2 class="text-center"><span class="glyphicon glyphicon-envelope" style="margin-right:10px;"></span><a href="mailto:support@esri.com"> support@esri.com</a></h2>'
                }
              },
              width: 12,
              showEditor: false
            }
          ]
        }
      ]
    },
    {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: false,
          isUrl: true,
          state: "",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "#f3f3ee",
          image: ""
        },
        color: "#333333"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown:
                    "<br/>\n<em>Copyright 2018. Washington, DC R&D Center (QA).</em>\n"
                }
              },
              width: 4,
              showEditor: false
            },
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown: "## About\n\n- Link\n- Link\n- Link"
                }
              },
              width: 4,
              showEditor: false
            },
            {
              component: {
                name: "markdown-card",
                settings: {
                  markdown: "## Contact Us \n \n- Link\n- Link\n- Link\n"
                }
              },
              width: 4,
              showEditor: false
            }
          ]
        }
      ]
    }
  ],
  header: {
    component: {
      name: "site-header",
      settings: {
        fullWidth: false,
        iframeHeight: "150px",
        iframeUrl: "",
        links: [],
        logoUrl: "",
        title: "Washington, DC R&D Center (QA)",
        markdown:
          '<nav class="navbar navbar-default navbar-static-top first-tier">\n  <div class="container">\n    <div class="navbar-header">\n      <div class="navbar-brand">\n        <div class="site-logo">\n          <img src="https://s3.amazonaws.com/geohub-assets/templates/sites/defaultSite/resources/50x50.png" alt="logo">\n          <h1>My Organization</h1>\n        </div>\n     </div>\n    </div>\n    <ul class="nav nav-pills pull-right" role="navigation">\n        <li><a href="#">Terms of Use</a></li>\n        <li><a href="#">Twitter</a></li>\n        <li><a href="#">Blog</a></li>\n    </ul>\n  </div>\n</nav>\n<nav class="navbar navbar-inverse navbar-static-top second-tier" role="navigation">\n      <div class="container">\n         <div class="navbar">\n          <ul class="nav navbar-nav">\n            <li class="active"><a href="#">Home</a></li>\n            <li><a href="#about">About</a></li>\n            <li><a href="#contact">Contact</a></li>\n          </ul>\n        </div>\n      </div>\n    </nav>\n',
        headerType: "default"
      }
    }
  }
};

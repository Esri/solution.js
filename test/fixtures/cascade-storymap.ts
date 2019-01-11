export default  {
  'source': 'fc14b48f49754353b7a94b27ed9ac731',
  'folderId': 'ebbdd10ebdc8461eacf44a643d6bc10f',
  'values': {
    'config': {
      'author': {
        'name': ''
      }
    },
    'settings': {
      'theme': {
        'colors': {
          'id': 'black-on-white-1',
          'label': 'Light',
          'themeMajor': 'light',
          'themeContrast': 'dark',
          'bgMain': 'white',
          'textMain': '#4c4c4c'
        }
      },
      'header': {}
    },
    'template': {
      'name': 'Story Map Cascade',
      'createdWith': '1.7.1',
      'editedWith': '1.7.1',
      'dataVersion': '1.0.0'
    },
    'sections': [
      {
        'type': 'cover',
        'foreground': {
          'title': 'Cascade',
          'subtitle': '',
          'options': {
            'titleStyle': {
              'shadow': false,
              'text': 'dark',
              'background': 'light'
            }
          }
        },
        'options': {},
        'layout': 'cover-1',
        'background': {
          'type': 'image',
          'image': {
            'url': 'resources/tpl/viewer/cover-placeholder/SteveRichey.jpg',
            'isPlaceholder': true,
            'options': {
              'size': 'small'
            },
            'width': 1920,
            'height': 1080
          }
        }
      },
      {
        'type': 'sequence',
        'background': {
          'type': 'color',
          'color': {
            'value': 'white'
          }
        },
        'foreground': {
          'blocks': [
            {
              'type': 'webmap',
              'webmap': {
                'type': 'webmap',
                'id': '234a94478490445cb4a57878451cb4b8',
                'options': {
                  'interaction': 'disabled',
                  'size': 'medium'
                },
                'extras': {
                  'locate': {
                    'enabled': false
                  },
                  'search': {
                    'enabled': false
                  },
                  'legend': {
                    'enabled': false
                  }
                },
                'caption': '',
                'popup': {
                  'layerId': 'DC_Police_4501',
                  'fieldName': 'FID',
                  'fieldValue': 9,
                  'anchorPoint': {
                    'x': -8573958.201735364,
                    'y': 4707431.842080245,
                    'spatialReference': {
                      'wkid': 102100
                    }
                  }
                }
              }
            }
          ]
        }
      },
      {
        'type': 'immersive',
        'options': {},
        'views': [
          {
            'transition': 'fade-fast',
            'background': {
              'type': 'webmap',
              'webmap': {
                'type': 'webmap',
                'id': '7db923b748c44666b09afc83ce833b87',
                'options': {
                  'interaction': 'disabled'
                },
                'extras': {
                  'locate': {
                    'enabled': false
                  },
                  'search': {
                    'enabled': false
                  },
                  'legend': {
                    'enabled': false
                  }
                },
                'extent': {
                  'xmin': -14265018.319190815,
                  'ymin': 2321631.7425200106,
                  'xmax': -7724454.682886593,
                  'ymax': 7110870.186754741,
                  'spatialReference': {
                    'wkid': 102100
                  }
                },
                'layers': []
              }
            },
            'foreground': {
              'panels': [
                {
                  'layout': 'scroll-full',
                  'settings': {
                    'position-x': 'left',
                    'size': 'medium',
                    'style': 'background',
                    'theme': 'white-over-black'
                  },
                  'blocks': [
                    {
                      'type': 'text',
                      'text': {
                        'value': '<p class="block">dis</p>'
                      }
                    }
                  ]
                }
              ],
              'title': {
                'value': '',
                'global': true,
                'style': {
                  'shadow': false,
                  'text': 'dark',
                  'background': 'light'
                }
              }
            }
          },
          {
            'transition': 'none',
            'background': {
              'type': 'webmap',
              'webmap': {
                'type': 'webmap',
                'id': '7db923b748c44666b09afc83ce833b87',
                'options': {
                  'interaction': 'button'
                },
                'extras': {
                  'locate': {
                    'enabled': false
                  },
                  'search': {
                    'enabled': false
                  },
                  'legend': {
                    'enabled': false
                  }
                },
                'layers': [],
                'extent': {
                  'xmin': -14265018.319190815,
                  'ymin': 2321631.7425200106,
                  'xmax': -7724454.682886593,
                  'ymax': 7110870.186754741,
                  'spatialReference': {
                    'wkid': 102100
                  }
                }
              }
            },
            'foreground': {
              'panels': [
                {
                  'layout': 'scroll-full',
                  'settings': {
                    'position-x': 'left',
                    'size': 'medium',
                    'style': 'background',
                    'theme': 'white-over-black'
                  },
                  'blocks': [
                    {
                      'type': 'text',
                      'text': {
                        'value': '<p class="block">butt</p>'
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            'transition': 'none',
            'background': {
              'type': 'webmap',
              'webmap': {
                'type': 'webmap',
                'id': '7db923b748c44666b09afc83ce833b87',
                'options': {
                  'interaction': 'enabled'
                },
                'extras': {
                  'locate': {
                    'enabled': false
                  },
                  'search': {
                    'enabled': false
                  },
                  'legend': {
                    'enabled': false
                  }
                },
                'layers': [],
                'extent': {
                  'xmin': -14265018.319190815,
                  'ymin': 2321631.7425200106,
                  'xmax': -7724454.682886593,
                  'ymax': 7110870.186754741,
                  'spatialReference': {
                    'wkid': 102100
                  }
                }
              }
            },
            'foreground': {
              'panels': [
                {
                  'layout': 'scroll-full',
                  'settings': {
                    'position-x': 'left',
                    'size': 'medium',
                    'style': 'background',
                    'theme': 'white-over-black'
                  },
                  'blocks': [
                    {
                      'type': 'text',
                      'text': {
                        'value': '<p class="block">en</p>'
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            'transition': 'fade-fast',
            'background': {
              'type': 'empty',
              'empty': 'empty'
            },
            'foreground': {
              'panels': [
                {
                  'layout': 'scroll-full',
                  'settings': {
                    'position-x': 'left',
                    'size': 'medium',
                    'style': 'background',
                    'theme': 'white-over-black'
                  },
                  'blocks': [
                    {
                      'type': 'text',
                      'text': {
                        'value': '<p class="block"></p>'
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    ]
  }
};

/* Copyright (c) 2020 Environmental Systems Research Institute, Inc.
 * Apache-2.0
 *
 * js-xss
 * Copyright (c) 2012-2018 Zongmin Lei(雷宗民) <leizongmin@gmail.com>
 * http://ucdok.com
 * The MIT License, see
 * https://github.com/leizongmin/js-xss/blob/master/LICENSE for details
 *
 * Lodash/isPlainObject
 * Copyright (c) JS Foundation and other contributors <https://js.foundation/>
 * MIT License, see https://raw.githubusercontent.com/lodash/lodash/4.17.10-npm/LICENSE for details
 * */
import isPlainObject from "lodash.isplainobject";
import xss from "xss";

/**
 * The response from the validate method
 *
 * @export
 * @interface IValidationResponse
 */
export interface IValidationResponse {
  isValid: boolean;
  sanitized: any;
}

export interface IWhiteList extends XSS.IWhiteList {
  source?: string[];
}

/** Options to apply to sanitize method */
export interface ISanitizeOptions {
  /* Don't convert undefined to null */
  allowUndefined?: boolean;
}

/**
 * The Sanitizer Class
 *
 * @export
 * @class Sanitizer
 */
/* istanbul ignore next */
export class Sanitizer {
  // Supported HTML Spec: https://doc.arcgis.com/en/arcgis-online/reference/supported-html.htm
  public readonly arcgisWhiteList: IWhiteList = {
    a: ["href", "target", "style"],
    img: ["src", "width", "height", "border", "alt", "style"],
    video: [
      "autoplay",
      "controls",
      "height",
      "loop",
      "muted",
      "poster",
      "preload",
      "width"
    ],
    audio: ["autoplay", "controls", "loop", "muted", "preload"],
    source: ["media", "src", "type"],
    span: ["style"],
    table: ["width", "height", "cellpadding", "cellspacing", "border", "style"],
    div: ["style", "align"],
    font: ["size", "color", "style"],
    tr: ["height", "valign", "align", "style"],
    td: [
      "height",
      "width",
      "valign",
      "align",
      "colspan",
      "rowspan",
      "nowrap",
      "style"
    ],
    th: [
      "height",
      "width",
      "valign",
      "align",
      "colspan",
      "rowspan",
      "nowrap",
      "style"
    ],
    p: ["style"],
    b: [],
    strong: [],
    i: [],
    em: [],
    u: [],
    br: [],
    li: [],
    ul: [],
    ol: [],
    hr: [],
    tbody: []
  };
  public readonly allowedProtocols: string[] = [
    "http",
    "https",
    "mailto",
    "iform",
    "tel",
    "flow",
    "lfmobile",
    "arcgis-navigator",
    "arcgis-appstudio-player",
    "arcgis-survey123",
    "arcgis-collector",
    "arcgis-workforce",
    "arcgis-explorer",
    "arcgis-trek2there",
    "mspbi",
    "comgooglemaps",
    "pdfefile",
    "pdfehttp",
    "pdfehttps",
    "boxapp",
    "boxemm",
    "awb",
    "awbs",
    "gropen",
    "radarscope"
  ];
  public readonly arcgisFilterOptions: XSS.IFilterXSSOptions = {
    allowCommentTag: true,
    safeAttrValue: (
      tag: string,
      name: string,
      value: string,
      cssFilter: XSS.ICSSFilter
    ): string => {
      // Take over safe attribute filtering for `a` `href`, `img` `src`,
      // and `source` `src` attributes, otherwise pass onto the
      // default `XSS.safeAttrValue` method.
      if (
        (tag === "a" && name === "href") ||
        ((tag === "img" || tag === "source") && name === "src")
      ) {
        return this.sanitizeUrl(value);
      }
      return xss.safeAttrValue(tag, name, value, cssFilter);
    }
  };
  public readonly xssFilterOptions: XSS.IFilterXSSOptions;
  private _xssFilter: XSS.ICSSFilter;

  constructor(filterOptions?: XSS.IFilterXSSOptions, extendDefaults?: boolean) {
    let xssFilterOptions: XSS.IFilterXSSOptions;

    if (filterOptions && !extendDefaults) {
      // Override the defaults
      xssFilterOptions = filterOptions;
    } else if (filterOptions && extendDefaults) {
      // Extend the defaults
      xssFilterOptions = Object.create(this.arcgisFilterOptions);
      Object.keys(filterOptions).forEach(key => {
        if (key === "whiteList") {
          // Extend the whitelist by concatenating arrays
          xssFilterOptions.whiteList = this._extendObjectOfArrays([
            this.arcgisWhiteList,
            filterOptions.whiteList || {}
          ]);
        } else {
          xssFilterOptions[key] = filterOptions[key];
        }
      });
    } else {
      // Only use the defaults
      xssFilterOptions = Object.create(this.arcgisFilterOptions);
      xssFilterOptions.whiteList = this.arcgisWhiteList;
    }

    this.xssFilterOptions = xssFilterOptions;
    // Make this readable to tests
    this._xssFilter = new xss.FilterXSS(xssFilterOptions);
  }

  /**
   * Sanitizes value to remove invalid HTML tags.
   *
   * Note: If the value passed does not contain a valid JSON data type (String,
   * Number, JSON Object, Array, Boolean, or null), the value will be nullified.
   *
   * @param {any} value The value to sanitize.
   * @returns {any} The sanitized value.
   * @memberof Sanitizer
   */
  public sanitize(value: any, options: ISanitizeOptions = {}): any {
    switch (typeof value) {
      case "number":
        if (isNaN(value) || !isFinite(value)) {
          return null;
        }
        return value;
      case "boolean":
        return value;
      case "string":
        return this._xssFilter.process(value);
      case "object":
        return this._iterateOverObject(value, options);
      default:
        if (options.allowUndefined && typeof value === "undefined") {
          return;
        }
        return null;
    }
  }

  /**
   * Sanitizes a URL string following the allowed protocols and sanitization rules.
   *
   * @param {string} value The URL to sanitize.
   * @returns {string} The sanitized URL.
   */
  public sanitizeUrl(value: string): string {
    const protocol = this._trim(value.substring(0, value.indexOf(":")));
    if (
      !(
        value === "/" ||
        value === "#" ||
        value[0] === "#" ||
        this.allowedProtocols.indexOf(protocol.toLowerCase()) > -1
      )
    ) {
      return "";
    } else {
      return xss.escapeAttrValue(value);
    }
  }

  /**
   * Checks if a value only contains valid HTML.
   *
   * @param {any} value The value to validate.
   * @returns {boolean}
   * @memberof Sanitizer
   */
  public validate(
    value: any,
    options: ISanitizeOptions = {}
  ): IValidationResponse {
    const sanitized = this.sanitize(value, options);

    return {
      isValid: value === sanitized,
      sanitized
    };
  }

  /**
   * Extends an object of arrays by by concatenating arrays of the same object
   * keys. If the if the previous key's value is not an array, the next key's
   * value will replace the previous key. This method is used for extending the
   * whiteList in the XSS filter options.
   *
   * @private
   * @param {Array<{}>} objects An array of objects.
   * @returns {{}} The extended object.
   * @memberof Sanitizer
   */
  private _extendObjectOfArrays(objects: Array<{}>): {} {
    const finalObj = {};

    objects.forEach(obj => {
      Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key]) && Array.isArray(finalObj[key])) {
          finalObj[key] = finalObj[key].concat(obj[key]);
        } else {
          finalObj[key] = obj[key];
        }
      });
    });

    return finalObj;
  }

  /**
   * Iterate over a plain object or array to deeply sanitize each value.
   *
   * @private
   * @param {object} obj The object to iterate over.
   * @returns {(object | null)} The sanitized object.
   * @memberof Sanitizer
   */
  private _iterateOverObject(
    obj: object,
    options: ISanitizeOptions = {}
  ): object | null | void {
    try {
      let hasChanged = false;
      let changedObj;
      if (Array.isArray(obj)) {
        changedObj = obj.reduce((prev, value) => {
          const validation = this.validate(value, options);
          if (validation.isValid) {
            return prev.concat([value]);
          } else {
            hasChanged = true;
            return prev.concat([validation.sanitized]);
          }
        }, []);
      } else if (!isPlainObject(obj)) {
        if (options.allowUndefined && typeof obj === "undefined") {
          return;
        }
        return null;
      } else {
        const keys = Object.keys(obj);
        changedObj = keys.reduce((prev, key) => {
          const value = obj[key];
          const validation = this.validate(value, options);
          if (validation.isValid) {
            prev[key] = value;
          } else {
            hasChanged = true;
            prev[key] = validation.sanitized;
          }
          return prev;
        }, {});
      }

      if (hasChanged) {
        return changedObj;
      }
      return obj;
    } catch (err) {
      return null;
    }
  }

  /**
   * Trim whitespace from the start and ends of a string.
   * @param {string} val The string to trim.
   * @returns {string} The trimmed string.
   */
  private _trim(val: string): string {
    return String.prototype.trim
      ? val.trim()
      : val.replace(/(^\s*)|(\s*$)/g, "");
  }
}

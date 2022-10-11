/** @license
 * Copyright 2022 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const timeZones = {
  "GMT-12:00": "Dateline Standard Time",
  "GMT-11:00": "Samoa Standard Time",
  "GMT-10:00": "Hawaiian Standard Time",
  "GMT-09:00": "Alaskan Standard Time",
  "GMT-08:00": "Pacific Standard Time",
  "GMT-07:00": "Mountain Standard Time",
  // "GMT-07:00": "Mexico Standard Time 2",
  // "GMT-07:00": "U.S. Mountain Standard Time",
  "GMT-06:00": "Central Standard Time",
  // "GMT-06:00": "Canada Central Standard Time",
  // "GMT-06:00": "Mexico Standard Time",
  // "GMT-06:00": "Central America Standard Time",
  "GMT-05:00": "Eastern Standard Time",
  // "GMT-05:00": "U.S. Eastern Standard Time",
  // "GMT-05:00": "S.A. Pacific Standard Time",
  "GMT-04:00": "Atlantic Standard Time",
  // "GMT-04:00": "S.A. Western Standard Time",
  // "GMT-04:00": "Pacific S.A. Standard Time",
  "GMT-03:30": "Newfoundland and Labrador Standard Time",
  "GMT-03:00": "E. South America Standard Time",
  // "GMT-03:00": "S.A. Eastern Standard Time",
  // "GMT-03:00": "Greenland Standard Time",
  "GMT-02:00": "Mid-Atlantic Standard Time",
  "GMT-01:00": "Azores Standard Time",
  // "GMT-01:00": "Cape Verde Standard Time",
  "GMT": "GMT Standard Time",
  // "GMT": "Greenwich Standard Time",
  "GMT+01:00": "Central Europe Standard Time",
  // "GMT+01:00": "Central European Standard Time",
  // "GMT+01:00": "Romance Standard Time",
  // "GMT+01:00": "W. Europe Standard Time",
  // "GMT+01:00": "W. Central Africa Standard Time",
  "GMT+02:00": "E. Europe Standard Time",
  // "GMT+02:00": "Egypt Standard Time",
  // "GMT+02:00": "FLE Standard Time",
  // "GMT+02:00": "GTB Standard Time",
  // "GMT+02:00": "Israel Standard Time",
  // "GMT+02:00": "South Africa Standard Time",
  "GMT+03:00": "Russian Standard Time",
  // "GMT+03:00": "Arab Standard Time",
  // "GMT+03:00": "E. Africa Standard Time",
  // "GMT+03:00": "Arabic Standard Time",
  "GMT+03:30": "Iran Standard Time",
  "GMT+04:00": "Arabian Standard Time",
  // "GMT+04:00": "Caucasus Standard Time",
  "GMT+04:30": "Transitional Islamic State of Afghanistan Standard Time",
  "GMT+05:00": "Ekaterinburg Standard Time",
  // "GMT+05:00": "West Asia Standard Time",
  "GMT+05:30": "India Standard Time",
  "GMT+05:45": "Nepal Standard Time",
  "GMT+06:00": "Central Asia Standard Time",
  // "GMT+06:00": "Sri Lanka Standard Time",
  // "GMT+06:00": "N. Central Asia Standard Time",
  "GMT+06:30": "Myanmar Standard Time",
  "GMT+07:00": "S.E. Asia Standard Time",
  // "GMT+07:00": "North Asia Standard Time",
  "GMT+08:00": "China Standard Time",
  // "GMT+08:00": "Singapore Standard Time",
  // "GMT+08:00": "Taipei Standard Time",
  // "GMT+08:00": "W. Australia Standard Time",
  // "GMT+08:00": "North Asia East Standard Time",
  "GMT+09:00": "Korea Standard Time",
  // "GMT+09:00": "Tokyo Standard Time",
  // "GMT+09:00": "Yakutsk Standard Time",
  "GMT+09:30": "A.U.S. Central Standard Time",
  // "GMT+09:30": "Cen. Australia Standard Time",
  "GMT+10:00": "A.U.S. Eastern Standard Time",
  // "GMT+10:00": "E. Australia Standard Time",
  // "GMT+10:00": "Tasmania Standard Time",
  // "GMT+10:00": "Vladivostok Standard Time",
  // "GMT+10:00": "West Pacific Standard Time",
  "GMT+11:00": "Central Pacific Standard Time",
  "GMT+12:00": "Fiji Islands Standard Time",
  // "GMT+12:00": "New Zealand Standard Time",
  "GMT+13:00": "Tonga Standard Time"
}

const supportedTimeZoneNames = [
  "Dateline Standard Time",
  "Samoa Standard Time",
  "Hawaiian Standard Time",
  "Alaskan Standard Time",
  "Pacific Standard Time",
  "Mountain Standard Time",
  "Mexico Standard Time 2",
  "U.S. Mountain Standard Time",
  "Central Standard Time",
  "Canada Central Standard Time",
  "Mexico Standard Time",
  "Central America Standard Time",
  "Eastern Standard Time",
  "U.S. Eastern Standard Time",
  "S.A. Pacific Standard Time",
  "Atlantic Standard Time",
  "S.A. Western Standard Time",
  "Pacific S.A. Standard Time",
  "Newfoundland and Labrador Standard Time",
  "E. South America Standard Time",
  "S.A. Eastern Standard Time",
  "Greenland Standard Time",
  "Mid-Atlantic Standard Time",
  "Azores Standard Time",
  "Cape Verde Standard Time",
  "GMT Standard Time",
  "Greenwich Standard Time",
  "Central Europe Standard Time",
  "Central European Standard Time",
  "Romance Standard Time",
  "W. Europe Standard Time",
  "W. Central Africa Standard Time",
  "E. Europe Standard Time",
  "Egypt Standard Time",
  "FLE Standard Time",
  "GTB Standard Time",
  "Israel Standard Time",
  "South Africa Standard Time",
  "Russian Standard Time",
  "Arab Standard Time",
  "E. Africa Standard Time",
  "Arabic Standard Time",
  "Iran Standard Time",
  "Arabian Standard Time",
  "Caucasus Standard Time",
  "Transitional Islamic State of Afghanistan Standard Time",
  "Ekaterinburg Standard Time",
  "West Asia Standard Time",
  "India Standard Time",
  "Nepal Standard Time",
  "Central Asia Standard Time",
  "Sri Lanka Standard Time",
  "N. Central Asia Standard Time",
  "Myanmar Standard Time",
  "S.E. Asia Standard Time",
  "North Asia Standard Time",
  "China Standard Time",
  "Singapore Standard Time",
  "Taipei Standard Time",
  "W. Australia Standard Time",
  "North Asia East Standard Time",
  "Korea Standard Time",
  "Tokyo Standard Time",
  "Yakutsk Standard Time",
  "A.U.S. Central Standard Time",
  "Cen. Australia Standard Time",
  "A.U.S. Eastern Standard Time",
  "E. Australia Standard Time",
  "Tasmania Standard Time",
  "Vladivostok Standard Time",
  "West Pacific Standard Time",
  "Central Pacific Standard Time",
  "Fiji Islands Standard Time",
  "New Zealand Standard Time",
  "Tonga Standard Time"
]

/**
 * Get the Preferred Time Reference object to be used when updating the definition of the service
 * Default value of Jan.1 <current year> is used to avoid using a time that would fall within daylight savings
 * 
 * @param ianaTimeZone Optional: The IANA time zone value to use. When not provided the value will be determined from the browser.
 * 
 * @returns Preferred Time Reference object
 */
export function getPreferredTimeReference(
  ianaTimeZone?: string
) {
  const timeZone =  _getTimeZoneName(ianaTimeZone);
  const respectsDaylightSaving = _getRespectsDaylightSaving();
  return {
    preferredTimeReference: {
      timeZone,
      respectsDaylightSaving
    }
  };
}

/**
 * Check if the local time honors daylight savings
 *
 * @param timeZone Optional: The IANA time zone value to use. When not provided the value will be determined from the browser.
 * 
 * @returns boolean True if daylight savings should be observed
 * @private
 */
export function _getRespectsDaylightSaving(
  timeZone?: string
) {
  const janTimeOffset = _getTimeZone(0, 1, timeZone);
  const octTimeOffset = _getTimeZone(9, 1, timeZone);
  return janTimeOffset !== octTimeOffset;
}

/**
 * Get the IANA time zone name
 *
 * @param month number 0 based index of month
 * @param day number day of the month
 * @param timeZone Optional: The IANA time zone value to use. When not provided the value will be determined from the browser.
 * 
 * @returns IANA time zone name
 * @private
 */
export function _getTimeZone(
  month: number,
  day: number,
  timeZone?: string
) {
  try {
    const formatOpts: Intl.DateTimeFormatOptions = {
      timeZoneName: "longOffset"
    };
    if (timeZone) {
      formatOpts.timeZone = timeZone;
    }
    const dateTimeFormat = new Intl.DateTimeFormat("en", formatOpts);
  
    return dateTimeFormat.formatToParts(
      new Date(2022, month, day)
    ).find(formatted => formatted.type === "timeZoneName").value;
  } catch (error) {
    console.error(error);
    return "Pacific Standard Time";
  }
}

/**
 * Get the simple time zone name as is needed by ArcGIS Pro
 *
 * @param timeZone Optional: The IANA time zone value to use. When not provided the value will be determined from the browser.
 * 
 * @returns IANA time zone name
 * @private
 */
export function _getTimeZoneName(
  timeZone?: string
) {
  const timeZoneName = _getTimeZone(0, 1, timeZone);
  return timeZones.hasOwnProperty(timeZoneName) ? timeZones[timeZoneName] : "";
}

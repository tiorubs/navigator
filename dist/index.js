"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _fs = require('fs');
var _mkdirp = require('mkdirp'); var _mkdirp2 = _interopRequireDefault(_mkdirp);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _https = require('https'); var _https2 = _interopRequireDefault(_https);
var _jimp = require('jimp'); var _jimp2 = _interopRequireDefault(_jimp);

const basicHeader = {
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-User": "?1",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-Mode": "navigate",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "max-age=0",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36",
};

Object.defineProperty(Object.prototype, "toCookieFormat", {
  value: function () {
    const params = this;
    var format = "";
    for (let key in params) {
      if (typeof params[key] === "function") continue;
      format += key + "=" + params[key] + "; ";
    }
    return format.slice(0, -1);
  },
  enumerable: false,
});

Object.defineProperty(Object.prototype, "toQuery", {
  value: function () {
    const params = this;
    var query = "";
    for (let key in params) {
      if (typeof params[key] === "function") continue;
      query +=
        encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
    }
    return query.slice(0, -1);
  },
  enumerable: false,
});

function Navigation() {
  let myCookies = {};

  const httpsAgent = new _https2.default.Agent({
    rejectUnauthorized: false,
  });

  function Get(url, requestConfig, retries = 30) {
    return new Promise((resolve, reject) => {
      requestConfig = requestConfig || {
        method: "GET",
        maxRedirects: 0,
        url,
        httpsAgent,
        timeout: 60000,
        headers: {
          ...basicHeader,
          Cookie: myCookies.toCookieFormat(),
        },
      };

      _axios2.default.call(void 0, requestConfig)
        .then((response) => {
          updateCookies(response);
          resolve(response);
        })
        .catch(({ response, code }) => {
          if (code === "ECONNABORTED" && retries > 0)
            return Get(url, requestConfig, retries - 1);
          if (!response) reject(false);
          updateCookies(response);
          reject(response);
        });
    });
  }

  function GetFile(url, filename, format = ".pdf", retries = 30) {
    return new Promise((resolve, reject) => {
      const requestConfig = {
        method: "GET",
        maxRedirects: 0,
        responseType: "arraybuffer",
        httpsAgent,
        url,
        timeout: 60000,
        headers: {
          ...basicHeader,
          Cookie: myCookies.toCookieFormat(),
        },
      };

      filename = filename + format;

      _axios2.default.call(void 0, requestConfig)
        .then(async (response) => {
          const folderPath = _path2.default.join(process.cwd(), "/files");
          const filepath = _path2.default.join(folderPath, filename);
          _mkdirp2.default.call(void 0, folderPath);
          resolve(
            await _fs.promises
              .writeFile(filepath, response.data)
              .then(() => filename)
              .catch(() => false)
          );
        })
        .catch(({ response, code }) => {
          if (code === "ECONNABORTED" && retries > 0)
            return GetFile(url, filename, format, retries - 1);
          if (!response) reject(false);
          updateCookies(response);
          reject(response);
        });
    });
  }

  function GetTiff(url, filename, format = ".jpg", retries = 30) {
    return new Promise((resolve, reject) => {
      const requestConfig = {
        method: "GET",
        maxRedirects: 0,
        responseType: "arraybuffer",
        httpsAgent,
        url,
        timeout: 60000,
        headers: {
          ...basicHeader,
          Cookie: myCookies.toCookieFormat(),
        },
      };

      filename = filename + format;

      _axios2.default.call(void 0, requestConfig)
        .then(async (response) => {
          const folderPath = _path2.default.join(process.cwd(), "/files");
          const filepath = _path2.default.join(folderPath, filename);
          _mkdirp2.default.call(void 0, folderPath);
          resolve(
            await _jimp2.default
              .read(response.data)
              .then((file) =>
                file
                  .resize(1102, 1559)
                  .writeAsync(filepath)
                  .then((a) => filename)
                  .catch((a) => false)
              )
              .catch((e) => false)
          );
        })
        .catch(({ response, code }) => {
          if (code === "ECONNABORTED" && retries > 0)
            return GetTiff(url, filename, format, retries - 1);
          if (!response) reject(false);
          updateCookies(response);
          reject(response);
        });
    });
  }

  function Post(url, body = {}, requestConfig, retries = 30) {
    return new Promise((resolve, reject) => {
      requestConfig = requestConfig || {
        method: "POST",
        maxRedirects: 0,
        url,
        httpsAgent,
        data: body.toQuery(),
        timeout: 60000,
        headers: {
          ...basicHeader,
          Cookie: myCookies.toCookieFormat(),
        },
        rejectUnauthorized: false,
      };

      _axios2.default.call(void 0, requestConfig)
        .then((response) => {
          updateCookies(response);
          resolve(response);
        })
        .catch(({ response, code }) => {
          if (code === "ECONNABORTED" && retries > 0)
            return Post(url, body, requestConfig, retries - 1);
          if (!response) reject(false);
          updateCookies(response);
          reject(response);
        });
    });
  }

  function updateCookies(response) {
    let Cookie = {};
    if (!response) return;
    const cookies = response.headers["set-cookie"];
    if (!cookies) return;
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].split(";")[0];
      const flag = cookie.indexOf("=");
      const value = cookie.substring(flag + 1);
      if (value.length === 0) continue;
      const key = cookie.slice(0, flag);
      delete myCookies[key];
      Cookie = { ...Cookie, [key]: value };
    }
    myCookies = { ...myCookies, ...Cookie };
  }

  function CleanCookies() {
    myCookies = {};
  }

  return {
    Get,
    Post,
    GetFile,
    GetTiff,
    CleanCookies,
    Cookies: () => myCookies.toCookieFormat(),
    jsonCookies: () => myCookies,
  };
}

exports. default = Navigation;

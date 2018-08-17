const http = window.require("http");
const https = window.require("https");
const URL = window.require("url");

// headers is [ { name: "...", value: "..." }, ...]
function getHeadersObj(headers, body) {
  const lowerCaseLookup = {};

  for (const header of headers) {
    const headerNameLowerCase = header.name.toLowerCase();
    let thisHeader = lowerCaseLookup[headerNameLowerCase];
    if (!thisHeader) {
      thisHeader = lowerCaseLookup[headerNameLowerCase] = {
        name: header.name,
        values: []
      };
    }

    thisHeader.values.push(header.value);
  }

  if (body && !lowerCaseLookup["content-length"]) {
    lowerCaseLookup["content-length"] = {
      name: "Content-Length",
      values: [Buffer.byteLength(body)]
    };
  }

  const result = {};
  for (const name of Object.keys(lowerCaseLookup)) {
    const thisHeader = lowerCaseLookup[name];
    result[thisHeader.name] = thisHeader.values;
  }

  return result;
}

export default function httpRequest(requestInfo, cancelToken) {
  return new Promise((resolve, reject) => {
    try {
      const { url, method, headers, body } = requestInfo;

      const headersObj = getHeadersObj(headers, body);

      const responseInfo = {
        body: "",
        rawRequest: "",
        parseErrorAfterBytes: null
      };

      const parsedUrl = URL.parse(url);
      const protocol = parsedUrl.protocol === "https:" ? https : http;
      const clientRequest = protocol.request(
        {
          method,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.path,
          headers: headersObj
        },
        httpResponse => {
          const { rawHeaders } = httpResponse;

          const responseHeaders = [];
          for (let i = 0; i < rawHeaders.length; i += 2) {
            const name = rawHeaders[i];
            const value = rawHeaders[i + 1];
            responseHeaders.push({ name, value });
          }

          responseInfo.httpVersion = httpResponse.httpVersion;
          responseInfo.statusCode = httpResponse.statusCode;
          responseInfo.statusMessage = httpResponse.statusMessage;
          responseInfo.headers = responseHeaders;

          httpResponse.setEncoding("utf-8"); // TODO: parse headers to get this encoding
          httpResponse.on("data", chunk => {
            responseInfo.body += chunk; // TODO: this can't be correct for non-standard encodings. fix.
          });
          httpResponse.on("end", () => {
            resolve(responseInfo);
          });
        }
      );

      cancelToken.subscribe(() => {
        console.log("cancelling node request");
        clientRequest.abort();
      });

      clientRequest.prependOnceListener("socket", function(socket) {
        socket.on("connect", err => {
          if (!err) {
            // note: get the responseInfo.socket information HERE instead of on the "socket" event
            // since at the socket information is not yet filled in when that "socket" event is raised.
            responseInfo.socket = {
              localAddress: socket.localAddress,
              localPort: socket.localPort,
              remoteAddress: socket.remoteAddress,
              remotePort: socket.remotePort
            };
          }
        });

        const previousWriteFunction = socket.write;
        socket.write = function(data, encoding, callback) {
          responseInfo.rawRequest += data || "";
          previousWriteFunction.call(socket, data, encoding, callback);
        };

        const previousEndFunction = socket.end;
        socket.end = function(data, encoding) {
          responseInfo.rawRequest += data || "";
          previousEndFunction.call(socket, data, encoding);
        };
      });

      clientRequest.on("error", e => {
        if (e.code === "HPE_INVALID_CONSTANT" && typeof e.bytesParsed === "number") {
          // This is "Parse Error" https://github.com/nodejs/node/issues/15582
          // where Content-Length is a lie
          responseInfo.parseErrorAfterBytes = e.bytesParsed;
          resolve(responseInfo);
        } else {
          reject(e);
        }
      });

      if (body) {
        clientRequest.write(body);
      }

      clientRequest.end();
    } catch (e) {
      reject(e);
    }
  });
}

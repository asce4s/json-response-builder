import { gzipSync } from "zlib";

class Response {
  headers: any = {};
  statusCode: number = 200;
  body: string;
  isBase64Encoded: boolean = false;

  constructor(responseBuilder: ResponseBuilder) {
    this.headers = responseBuilder.getHeaders;
    this.statusCode = responseBuilder.getStatusCode;
    this.body = responseBuilder.getBody;
    this.isBase64Encoded = responseBuilder.isBase64Encoded;
  }
}

class ResponseBuilder {
  private _headers: Record<string, unknown> = {};
  private _statusCode: number = 200;
  private _body: string;
  private _gzip: boolean = false;
  private _base64Encoded: boolean = false;

  get getHeaders(): Record<string, unknown> {
    return this._headers;
  }

  get getStatusCode() {
    return this._statusCode;
  }

  get getBody() {
    return this._body;
  }

  get isBase64Encoded() {
    return this._base64Encoded;
  }

  base64Encoded(base64Encoded: boolean) {
    this._base64Encoded = base64Encoded;
    return this;
  }

  headers(headers: Record<string, unknown>) {
    this._headers = { ...this.headers, headers };
    return this;
  }

  json(body: Record<string, unknown>) {
    this._headers = { ...this.headers, "content-type": "application/json" };
    this._body = JSON.stringify(body, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
    return this;
  }

  statusCode(statusCode: number) {
    this._statusCode = statusCode;
    return this;
  }

  gzip() {
    this._gzip = true;
    return this;
  }

  build() {
    if (this._gzip) {
      this._base64Encoded = true;
      this._headers = {
        ...this.headers,
        "Content-Type": "application/json",
        "Content-Encoding": "gzip",
        "accept-encoding": "gzip,deflate",
      };
      const gzip = gzipSync(this._body);
      this._body = gzip.toString("base64");
    }

    return new Response(this);
  }
}

export default ResponseBuilder;

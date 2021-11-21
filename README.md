# json-response-builder

This package helps to build json response from server side. This will be specially helpfull in serverless environments.

## Installation

```bash
npm i json-response-builder
```

## Simple Usage

```javascript
import {res} from "json-response-builder"

# returns a json body
return res.json({
          "key":"value" //JSON BODY HERE
       })

```
This would output a response as bellow
```
 {
  headers: { 'content-type': 'application/json' },
  statusCode: 400,
  isBase64Encoded: false,
  body: '{"key":"value"}'
 }
```

## Options
Can include additional headers and options as below
```javascript
import {res} from "json-response-builder"

  res
    .json({
        "key": "value",
     })
    .headers({
        "headerKey":"headerValue"
    })
    .gzip() //apply gzip compression
    .statusCode(400)
    .build()

```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
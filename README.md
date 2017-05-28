# vRealize Operations Manager (vROps) Shim for OpsGenie

A vROps shim build with a NodeJs HTTPS server.

# Running

The following environment variables must/should be set before running the server:

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `HTTPS_PORT` | No | `3000` | The port to bind the HRTTPS server to. |
| `HTTPS_SERVER_PEM_FILE` | No | `server.pem` | The PEM file containing both the HTTPS private key and the HTTPS certificate. |
| `OPSGENIE_API_KEY` | Yes | | The OpsGenie API key for creating and managing alerts. |
| `VROPS_API_ENDPOINT_FQDN` | No | | The vROps API endpoint to be used for correlating alerts with OpsGenie. |

Sample call:

```
HTTPS_PORT=1234 \
OPSGENIE_API_KEY=123e4567-e89b-12d3-a456-426655440000 \
VROPS_API_ENDPOINT_FQDN=vrops.mydomain.net \
node index.js
```

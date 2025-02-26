// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0

import Document, { DocumentContext, Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import {context, propagation} from "@opentelemetry/api";

const { 
  ENV_PLATFORM, 
  WEB_OTEL_SERVICE_NAME, 
  PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT, 
  OTEL_COLLECTOR_HOST, 
  CORALOGIX_RUM_ENV,
  CORALOGIX_RUM_APP,
  CORALOGIX_RUM_KEY,
  CORALOGIX_RUM_ENABLE,
  CORALOGIX_RUM_DOMAIN,
  CORALOGIX_RUM_VERSION,
  CORALOGIX_RUM_SDK_URL,
  CORALOGIX_RUM_USER_EMAIL,
  CORALOGIX_RUM_USER_NAME,
  CORALOGIX_RUM_USER_ID,
} = process.env;

export default class MyDocument extends Document<{ envString: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: App => props => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      const baggage = propagation.getBaggage(context.active());
      const isSyntheticRequest = baggage?.getEntry('synthetic_request')?.value === 'true';

      const otlpTracesEndpoint = isSyntheticRequest
          ? `http://${OTEL_COLLECTOR_HOST}:4318/v1/traces`
          : PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;

      const envString = `
        window.ENV = {
          NEXT_PUBLIC_PLATFORM: '${ENV_PLATFORM}',
          NEXT_PUBLIC_OTEL_SERVICE_NAME: '${WEB_OTEL_SERVICE_NAME}',
          NEXT_PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: '${otlpTracesEndpoint}',
          IS_SYNTHETIC_REQUEST: '${isSyntheticRequest}',
          NEXT_PUBLIC_CORALOGIX_RUM_ENV: '${CORALOGIX_RUM_ENV}',
          NEXT_PUBLIC_CORALOGIX_RUM_APP: '${CORALOGIX_RUM_APP}',
          NEXT_PUBLIC_CORALOGIX_RUM_KEY: '${CORALOGIX_RUM_KEY}',
          NEXT_PUBLIC_CORALOGIX_RUM_ENABLE: '${CORALOGIX_RUM_ENABLE}',
          NEXT_PUBLIC_CORALOGIX_RUM_DOMAIN: '${CORALOGIX_RUM_DOMAIN}',
          NEXT_PUBLIC_CORALOGIX_RUM_VERSION: '${CORALOGIX_RUM_VERSION}',
          NEXT_PUBLIC_CORALOGIX_RUM_SDK_URL: '${CORALOGIX_RUM_SDK_URL}',
          NEXT_PUBLIC_CORALOGIX_RUM_USER_EMAIL: '${CORALOGIX_RUM_USER_EMAIL}',
          NEXT_PUBLIC_CORALOGIX_RUM_USER_NAME: '${CORALOGIX_RUM_USER_NAME}',
          NEXT_PUBLIC_CORALOGIX_RUM_USER_ID: '${CORALOGIX_RUM_USER_ID}',
        };`;
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
        envString,
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <script dangerouslySetInnerHTML={{ __html: this.props.envString }}></script>
          <NextScript />
        </body>
      </Html>
    );
  }
}

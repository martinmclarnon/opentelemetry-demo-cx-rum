'use client';
import { useEffect } from 'react';

// Define a type-safe structure for window.CoralogixRum
interface CoralogixRumSDK {
    init: (config: Record<string, unknown>) => void;
    screenshot?: (message: string) => string;
}

export default function CoralogixRumInit() {
    useEffect(() => {
        const loadScript = async () => {
            // Define a type-safe way to access window.ENV
            const env = (window as unknown as { 
                ENV?: { 
                    NEXT_PUBLIC_CORALOGIX_RUM_SDK_URL?: string;
                    NEXT_PUBLIC_CORALOGIX_RUM_ENV?: string;
                    NEXT_PUBLIC_CORALOGIX_RUM_APP?: string;
                    NEXT_PUBLIC_CORALOGIX_RUM_VERSION?: string;
                    NEXT_PUBLIC_CORALOGIX_RUM_KEY?: string;
                    NEXT_PUBLIC_CORALOGIX_RUM_DOMAIN?: string;
                    NEXT_PUBLIC_CORALOGIX_RUM_USER_EMAIL?: string;
                    NEXT_PUBLIC_CORALOGIX_RUM_USER_NAME?: string;
                    NEXT_PUBLIC_CORALOGIX_RUM_USER_ID?: string;
                } 
            }).ENV || {};

            const scriptSrc: string = env.NEXT_PUBLIC_CORALOGIX_RUM_SDK_URL || "";

            if (document.querySelector(`script[src="${scriptSrc}"]`)) {
                console.log("Coralogix RUM script already loaded.");
                return;
            }

            const script = document.createElement('script');
            script.src = scriptSrc;
            script.async = true;
            script.onload = () => {
                console.log('Coralogix RUM script loaded successfully!');

                // Ensure type safety for window.CoralogixRum
                const coralogixRum = (window as unknown as { CoralogixRum?: CoralogixRumSDK }).CoralogixRum;

                if (coralogixRum) {
                    console.log('Initializing Coralogix RUM...');
                    coralogixRum.init({
                        environment: env.NEXT_PUBLIC_CORALOGIX_RUM_ENV || "",
                        application: env.NEXT_PUBLIC_CORALOGIX_RUM_APP || "",
                        debug: true,
                        version: env.NEXT_PUBLIC_CORALOGIX_RUM_VERSION || "",
                        public_key: env.NEXT_PUBLIC_CORALOGIX_RUM_KEY || "",
                        coralogixDomain: env.NEXT_PUBLIC_CORALOGIX_RUM_DOMAIN || "",
                        user_context: {
                            user_email: env.NEXT_PUBLIC_CORALOGIX_RUM_USER_EMAIL || "",
                            user_name: env.NEXT_PUBLIC_CORALOGIX_RUM_USER_NAME || "",
                            user_id: env.NEXT_PUBLIC_CORALOGIX_RUM_USER_ID || "",
                        },
                        sessionConfig: {
                            sessionSampleRate: 100,
                            alwaysTrackSessionsWithErrors: true,
                        },
                        instrumentations: {
                            errors: true,
                            fetch: true,
                            xhr: true,
                            custom: true,
                            long_tasks: true,
                            resources: true,
                            interactions: true,
                            web_vitals: true,
                        },
                        sessionRecordingConfig: {
                            enable: true,
                            autoStartSessionRecording: true,
                            maskInputOptions: { password: true },
                            recordConsoleEvents: true,
                            recordCanvas: true,
                        },
                        traceParentInHeader: {
                            enabled: true,
                            options: {
                                propagateTraceHeaderCorsUrls: [
                                    new RegExp('http://*'),
                                    new RegExp('https://*')
                                ],
                                propagateB3TraceHeader: {
                                    singleHeader: true,
                                    multiHeader: true,
                                },
                                propagateAwsXrayTraceHeader: true,
                            },
                        },
                        beforeSend: (event: Record<string, unknown>) => {
                            if ((event.event_context as { type?: string })?.type === 'error') {
                                const screenshotId = coralogixRum.screenshot?.('Creating a screenshot due to an error!');
                                (event as { screenshotId?: string }).screenshotId = screenshotId;
                            }
                            return event;
                        },
                        labels: {
                            runningFrom: 'MacHost',
                        },
                    });
                } else {
                    console.error('Coralogix RUM failed to initialize.');
                }
            };

            document.body.appendChild(script);
        };

        loadScript();
    }, []);

    return null;
}
import {createBackendModule} from "@backstage/backend-plugin-api";
import {authProvidersExtensionPoint, createOAuthProviderFactory} from "@backstage/plugin-auth-node";
import {microsoftAuthenticator} from "@backstage/plugin-auth-backend-module-microsoft-provider";
import {DEFAULT_NAMESPACE, stringifyEntityRef} from "@backstage/catalog-model";

export const authModuleMicrosoftProvider = createBackendModule({
    pluginId: 'auth',
    moduleId: 'microsoftProvider',
    register(reg: any) {
        reg.registerInit({
            deps: { providers: authProvidersExtensionPoint },
            async init({ providers }: any) {
                providers.registerProvider({
                    providerId: 'microsoft',
                    factory: createOAuthProviderFactory({
                        authenticator: microsoftAuthenticator,
                        async signInResolver({profile}: any, ctx: any) {
                            if (!profile.email) {
                                throw new Error(
                                    'Login failed, user profile does not contain an email',
                                );
                            }
                            const [localPart] = profile.email.split('@');
                            const userEntityRef = stringifyEntityRef({
                                kind: 'User',
                                name: localPart,
                                namespace: DEFAULT_NAMESPACE,
                            });

                            return ctx.issueToken({
                                claims: {
                                    sub: userEntityRef,
                                    ent: [userEntityRef],
                                },
                            });
                        },
                    }),
                });
            },
        });
    },
});
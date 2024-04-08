import {createBackendModule} from "@backstage/backend-plugin-api";
import {
    authProvidersExtensionPoint,
    commonSignInResolvers,
    createOAuthProviderFactory
} from "@backstage/plugin-auth-node";
import {microsoftAuthenticator} from "@backstage/plugin-auth-backend-module-microsoft-provider";
import {DEFAULT_NAMESPACE, stringifyEntityRef} from "@backstage/catalog-model";
import {githubAuthenticator, githubSignInResolvers} from "@backstage/plugin-auth-backend-module-github-provider";

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

export const authModuleGithubProvider = createBackendModule({
    pluginId: 'auth',
    moduleId: 'github-provider',
    register(reg) {
        reg.registerInit({
            deps: {
                providers: authProvidersExtensionPoint,
            },
            async init({ providers }) {
                providers.registerProvider({
                    providerId: 'github',
                    factory: createOAuthProviderFactory({
                        authenticator: githubAuthenticator,
                        signInResolverFactories: {
                            ...githubSignInResolvers,
                            ...commonSignInResolvers,
                        },
                    }),
                });
            },
        });
    },
});
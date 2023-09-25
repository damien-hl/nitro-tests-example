import { defu } from "defu";
import { joinURL } from "ufo";
import { fetch } from "ofetch";
import { resolve } from "pathe";
import { afterAll } from "vitest";
import { type Listener } from "listhen";
import { type NitroConfig, type Nitro, createNitro, prepare, build, createDevServer } from "nitropack";

// This context is used to keep track of the Nitro instance, the server
// running in the background and some other useful information and utilities.
type Context = {
    outDir: string,
    nitro?: Nitro,
    listener?: Listener,
    fetch: (path: string, options?: RequestInit) => Promise<Response>,
}

// This function should be used to setup the tests.
// It will programmatically build the app and start the server.
// It will also return a context object that can be used to make requests
// to the server.
// When the tests are done, the Nitro instance and the server will be closed.
export const setupTests = async (options: { nitroConfig?: NitroConfig } = {}) => {
    const ctx: Context = {
        outDir: resolve(".output"),
        fetch: (path, options) => fetch(joinURL(ctx.listener!.url, path.slice(1)), {
            redirect: "manual",
            ...options,
        }),
    };

    ctx.nitro = await createNitro(
        defu(options.nitroConfig, {
            dev: true,
            output: {
                dir: ctx.outDir,
            },
            preset: "nitro-dev"
        } satisfies NitroConfig),
    );

    const ready = (nitro: Nitro) => new Promise<void>((resolve) => {
        nitro.hooks.hook("dev:reload", () => resolve());
    });

    // Start the server.
    const devServer = createDevServer(ctx.nitro);
    ctx.listener = await devServer.listen({});

    // Ensure the output directory exists and is empty.
    await prepare(ctx.nitro);
    // Build the app.
    await build(ctx.nitro);
    // Wait for the app to be ready.
    await ready(ctx.nitro);

    afterAll(async () => {
        // Close the server and the Nitro instance.
        await ctx.listener?.close();
        await ctx.nitro?.close();
    });

    return ctx;
};

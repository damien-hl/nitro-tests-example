import { defu } from "defu";
import { fetch } from "ofetch";
import { resolve } from "pathe";
import { afterAll } from "vitest";
import { Listener, listen } from "listhen";
import { type NitroConfig, type Nitro, createNitro, prepare, build } from "nitropack";
import { joinURL } from "ufo";

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
            output: {
                dir: ctx.outDir,
            },
            preset: "node"
        } satisfies NitroConfig),
    );

    // Ensure the output directory exists and is empty.
    await prepare(ctx.nitro);
    // Build the app.
    await build(ctx.nitro);

    // Import the server entry point.
    const entryPath = resolve(ctx.outDir, "server/index.mjs");
    const { listener } = await import(entryPath);

    // Start the server and keep track of the listener.
    ctx.listener = await listen(listener);

    afterAll(async () => {
        // Close the server and the Nitro instance.
        await ctx.listener?.close();
        await ctx.nitro?.close();
    });

    return ctx;
};

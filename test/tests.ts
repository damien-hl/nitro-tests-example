import { type Nitro } from "nitropack";

// This context is used to keep track of the Nitro instance, the server
// running in the background and some other useful information and utilities.
type Context = {
    outDir: string,
    nitro: Nitro,
}

// This function should be used to setup the tests.
// It will programmatically build the app and start the server.
// It will also return a context object that can be used to make requests
// to the server.
// When the tests are done, the Nitro instance and the server will be closed.
export const setupTests = () => {};

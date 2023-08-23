import { setupTests } from "../../tests";
import { describe, expect, test } from "vitest";

describe("index route", async () => {
    const ctx = await setupTests();

    test("returns a 200", async () => {
        const { status } = await ctx.fetch("/");
        expect(status).toBe(200);
    });

    test("returns { nitro: Is Awesome }", async () => {
        const response = await ctx.fetch("/");
        expect(await response.json()).toMatchObject({ nitro: "Is Awesome!" });
    });
});

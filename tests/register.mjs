// Node's built-in test runner, with the repository's TypeScript/path aliases.
import { registerHooks } from "node:module"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { url: "data:text/javascript,export {}", shortCircuit: true }
    }
    if (specifier.startsWith("@/")) {
      const path = fileURLToPath(
        new URL(`../${specifier.slice(2)}`, import.meta.url)
      )
      const match = [path, `${path}.ts`, `${path}.tsx`].find(existsSync)
      if (match) return { url: pathToFileURL(match).href, shortCircuit: true }
    }
    if (
      ["next/headers", "next/navigation", "next/server"].includes(specifier)
    ) {
      return nextResolve(`${specifier}.js`, context)
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (
      url.startsWith("file:") &&
      /\.tsx?$/.test(url) &&
      !url.includes("/node_modules/")
    ) {
      const { outputText } = ts.transpileModule(
        readFileSync(new URL(url), "utf8"),
        {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }
      )
      return { format: "module", source: outputText, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})

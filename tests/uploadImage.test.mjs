import { homedir } from "node:os";
import { join } from "node:path";
import { uploadImage } from "../app/(app)/my-listing/new/image.server.ts";

const imagePath = join(
  homedir(),
  "money/project-hail-mary/public/shared/mascots/book-mascot/expressions/mascot-calm.png"
);

const result = await uploadImage(imagePath);
console.log(result);

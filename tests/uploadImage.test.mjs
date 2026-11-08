import assert from "node:assert/strict"
import { Writable } from "node:stream"
import { beforeEach, mock, test } from "node:test"
import sharp from "sharp"
import { ImageSchema } from "../schemas/image.schema.ts"
import { ImageFileSchema, MAX_FILE_SIZE } from "../schemas/image-file.schema.ts"

let sessionError
let uploadError
let omitResult
let streamError
let uploads
let completed

mock.module("../lib/auth/session.ts", {
  namedExports: {
    requireSession: async () => {
      if (sessionError) throw sessionError
      return { uid: "student" }
    },
  },
})
mock.module("../lib/cloudinary.ts", {
  namedExports: {
    cloudinary: {
      uploader: {
        upload_stream(options, callback) {
          const index = uploads.length
          const record = { options }
          uploads.push(record)
          return new Writable({
            write(bytes, _encoding, done) {
              record.bytes = Buffer.from(bytes)
              if (streamError) return done(streamError)
              // Complete in reverse order to check batch result ordering.
              setTimeout(
                () => {
                  completed++
                  callback(
                    uploadError,
                    omitResult
                      ? undefined
                      : { secure_url: `https://images.test/${index}` }
                  )
                },
                index === 0 ? 15 : 1
              )
              done()
            },
          })
        },
      },
    },
  },
})

const { uploadImage, uploadImages } =
  await import("../app/(app)/my-listing/new/image.server.ts")

beforeEach(() => {
  sessionError = undefined
  uploadError = undefined
  omitResult = false
  streamError = undefined
  uploads = []
  completed = 0
})

async function image({ width = 640, height = 480, format = "png" } = {}) {
  const bytes = await sharp({
    create: { width, height, channels: 3, background: "green" },
  })
    .toFormat(format)
    .toBuffer()
  return new File([bytes], `photo.${format}`, { type: `image/${format}` })
}

for (const format of ["jpeg", "png", "webp"]) {
  test(`accepts a real ${format} image`, async () => {
    const file = await image({ format })
    assert.equal(await ImageSchema.parseAsync(file), file)
    assert.equal(ImageFileSchema.safeParse(file).success, true)
  })
}

test("accepts both dimension boundaries", async () => {
  for (const [width, height] of [
    [320, 240],
    [1200, 720],
  ]) {
    assert.equal(
      (await ImageSchema.safeParseAsync(await image({ width, height })))
        .success,
      true
    )
  }
})

test("rejects out-of-bounds dimensions before uploading", async () => {
  for (const [width, height] of [
    [319, 480],
    [1201, 480],
    [640, 239],
    [640, 721],
  ]) {
    await assert.rejects(uploadImage(await image({ width, height })))
  }
  assert.equal(uploads.length, 0)
})

test("rejects wrong input, empty, oversized, unsupported and unreadable files", async () => {
  const invalid = [
    "blob:preview-only",
    { name: "photo.png", type: "image/png", size: 100 },
    new File([], "empty.png", { type: "image/png" }),
    new File([new Uint8Array(MAX_FILE_SIZE + 1)], "large.png", {
      type: "image/png",
    }),
    new File(["text"], "text.txt", { type: "text/plain" }),
    new File(["not image bytes"], "fake.png", { type: "image/png" }),
  ]
  for (const file of invalid) await assert.rejects(uploadImage(file))
  assert.equal(uploads.length, 0)
})

test("rejects an unsupported actual format disguised as PNG", async () => {
  const gif = await image({ format: "gif" })
  await assert.rejects(
    uploadImage(new File([gif], "fake.png", { type: "image/png" }))
  )
  assert.equal(uploads.length, 0)
})

test("requires authentication for single and batch uploads", async () => {
  sessionError = new Error("No session")
  const file = await image()
  await assert.rejects(uploadImage(file), /No session/)
  await assert.rejects(uploadImages([file]), /No session/)
  assert.equal(uploads.length, 0)
})

test("sends the original file bytes and returns only the secure URL", async () => {
  const file = await image()
  assert.equal(await uploadImage(file), "https://images.test/0")
  assert.deepEqual(uploads[0].bytes, Buffer.from(await file.arrayBuffer()))
  assert.equal(uploads[0].options.resource_type, "image")
  assert.equal(uploads[0].options.overwrite, false)
})

test("batch waits for all uploads and preserves cover order", async () => {
  const files = await Promise.all([
    image(),
    image({ format: "webp" }),
    image({ format: "jpeg" }),
  ])
  assert.deepEqual(await uploadImages(files), [
    "https://images.test/0",
    "https://images.test/1",
    "https://images.test/2",
  ])
  assert.equal(completed, 3)
})

test("validates the whole batch and enforces the photo limit before uploads", async () => {
  const file = await image()
  await assert.rejects(uploadImages([]))
  await assert.rejects(uploadImages([file, file, file, file]))
  await assert.rejects(
    uploadImages([file, new File(["bad"], "bad.png", { type: "image/png" })])
  )
  assert.equal(uploads.length, 0)
})

test("propagates Cloudinary callback errors", async () => {
  uploadError = new Error("Upload failed")
  await assert.rejects(uploadImage(await image()), /Upload failed/)
})

test("propagates upload stream errors", async () => {
  streamError = new Error("Stream failed")
  await assert.rejects(uploadImage(await image()), /Stream failed/)
})

test("rejects a missing Cloudinary response", async () => {
  omitResult = true
  await assert.rejects(uploadImage(await image()), /Image upload failed/)
})

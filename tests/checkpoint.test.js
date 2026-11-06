import { test, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../src/app.js";
const stage = 2;
let db, server;
after(async () => {
  if (server)
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  await mongoose.disconnect();
  await db?.stop();
});
test("runnable cumulative chapter: health, success and failure contracts", async () => {
  const mail = new Map();
  const config = { jwtSecret: "a".repeat(40), otpSecret: "b".repeat(40) };
  const app = createApp({
    config,
    email: { send: async (email, code) => mail.set(email, code) },
    images: {
      upload: async () => ({ publicId: "smoke-image", url: "https://example.test/image.png" }),
      destroy: async () => {},
    },
  });
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  const api = request(server);
  assert.equal((await api.get("/health")).body.status, "OK");
  if (stage < 2) return;
  db = await MongoMemoryServer.create();
  await mongoose.connect(db.getUri());
  for (const model of Object.values(mongoose.models)) await model.init();
  const call = (method, url, token, body) => {
    let r = api[method]("/api" + url);
    if (token) r = r.set("Authorization", `Bearer ${token}`);
    return body ? r.send(body) : r;
  };
  await call("post", "/auth/signup", null, {}).expect(422);
  const credentials = {
    name: "Student",
    email: "stage@example.test",
    password: "classroom-password",
  };
  await call("post", "/auth/signup", null, credentials).expect(201);
  await call("post", "/auth/verify", null, {
    email: credentials.email,
    code: mail.get(credentials.email),
  }).expect(200);
  await call("post", "/auth/verify", null, {
    email: credentials.email,
    code: mail.get(credentials.email),
  }).expect(400);
  const token = (await call("post", "/auth/login", null, credentials).expect(200)).body.data.token;
  if (stage < 3) return;
  await call("post", "/auth/logout").expect(401);
  await call("post", "/auth/logout", token).expect(200);
  if (stage < 4) return;
  await call("get", "/users/me", token).expect(200);
  await call("get", "/users", token).expect(403);
  const User = mongoose.model("User");
  const user = await User.findOne({ email: credentials.email });
  user.role = "admin";
  await user.save();
  if (stage < 5) return;
  const category = (await call("post", "/categories", token, { name: "Phones" }).expect(201)).body
    .data;
  if (stage < 6) return;
  const fields = {
    title: "Working phone",
    description: "A working phone with its charger",
    price: 100,
    city: "Lahore",
    category: category._id,
  };
  const ad = (await call("post", "/ads", token, fields).expect(201)).body.data;
  await call("get", `/ads/${ad._id}`).expect(404);
  await call("get", "/ads/mine", token).expect(200);
  await call("get", "/ads?limit=500").expect(422);
  if (stage < 7) return;
  await call("patch", `/ads/${ad._id}`, token, { ...fields, price: 90 }).expect(200);
  await call("post", `/ads/${ad._id}/publish`, token).expect(409);
  if (stage < 8) return;
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jQ1sAAAAASUVORK5CYII=",
    "base64",
  );
  await call("post", `/ads/${ad._id}/images`, token)
    .attach("images", png, { filename: "real.png", contentType: "image/png" })
    .expect(201);
  await call("post", `/ads/${ad._id}/publish`, token).expect((response) =>
    assert.equal(response.status, 200, JSON.stringify(response.body)),
  );
  const Listing = mongoose.model("Listing");
  if (stage >= 13)
    await call("post", `/moderation/ads/${ad._id}`, token, { decision: "approve" }).expect(200);
  else await Listing.updateOne({ _id: ad._id }, { $set: { status: "published" } }); // Test fixture until staff route arrives.
  await call("get", `/ads/${ad._id}`).expect(200);
  if (stage < 11) return;
  await call("put", `/favorites/${ad._id}`, token).expect(200);
  await call("put", `/favorites/${ad._id}`, token).expect(200);
  assert.equal(await mongoose.model("Favorite").countDocuments(), 1);
  if (stage < 12) return;
  const buyer = { name: "Buyer", email: "buyer@example.test", password: "classroom-password" };
  await call("post", "/auth/signup", null, buyer).expect(201);
  await call("post", "/auth/verify", null, {
    email: buyer.email,
    code: mail.get(buyer.email),
  }).expect(200);
  const buyerToken = (await call("post", "/auth/login", null, buyer)).body.data.token;
  const chat = (await call("post", "/conversations", buyerToken, { listing: ad._id }).expect(201))
    .body.data;
  await call("post", `/conversations/${chat._id}/messages`, buyerToken, {
    text: "Hello seller",
  }).expect(201);
  await call("get", `/conversations/${chat._id}/messages`, token).expect(200);
  if (stage < 13) return;
  const report = (
    await call("post", "/reports", buyerToken, {
      listing: ad._id,
      reason: "Investigate ad please",
    }).expect(201)
  ).body.data;
  await call("post", `/moderation/reports/${report._id}/resolve`, token).expect(200);
});

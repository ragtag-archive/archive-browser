import jsonwebtoken from "jsonwebtoken";
import { DRIVE_BASE_URL, FILE_JWT_PRIVATE_KEY } from "./config";
import { VideoFile } from "./database";

export const signURL = (url: string, ip: string) => {
  const u = new URL(url);
  const host = u.hostname;
  const path = u.pathname;

  const jwt = jsonwebtoken.sign(
    {
      host,
      path,
      ip,
    },
    FILE_JWT_PRIVATE_KEY,
    {
      algorithm: "ES256",
      expiresIn: "3h",
      issuer: "archive.ragtag.moe",
    }
  );
  u.searchParams.set("X-Ragtag-Auth", jwt);
  return u.toString();
};

export const signFileURLs = (files: VideoFile[], ip: string) =>
  files.forEach((file, idx) => {
    files[idx].url = signURL(
      file.url ||
        DRIVE_BASE_URL + "/" + file.name.split(".")[0] + "/" + file.name,
      ip
    );
  });

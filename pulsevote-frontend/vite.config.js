import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

const keyPath = "ssl/key.pem";
const certPath = "ssl/cert.pem";

const hasHttpsCertificates =
  fs.existsSync(keyPath) &&
  fs.existsSync(certPath);

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    https: hasHttpsCertificates
      ? {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath)
        }
      : false
  }
});
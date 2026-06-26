import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Le poste de dev contient un autre lockfile plus haut dans l'arborescence ;
  // on fixe explicitement la racine du projet.
  turbopack: { root: projectRoot },
  images: {
    // Les images produits sont hébergées sur des plateformes externes.
    // On autorise tout domaine HTTPS pour simplifier l'ajout de produits via la base.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;

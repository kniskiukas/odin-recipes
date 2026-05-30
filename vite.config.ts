import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main:              resolve(__dirname, 'index.html'),
                aboutMe:           resolve(__dirname, 'about_me/index.html'),
                photography:       resolve(__dirname, 'photography/index.html'),
                recipes:           resolve(__dirname, 'recipes/index.html'),
                recipesAugusto:    resolve(__dirname, 'recipes/augusto_pyragas/index.html'),
                recipesCirviniai:  resolve(__dirname, 'recipes/cirviniai_blynai/index.html'),
                recipesKepta:      resolve(__dirname, 'recipes/kepta_duona/index.html'),
                recipesSurio:      resolve(__dirname, 'recipes/surio_tortas/index.html'),
                recipesTinginys:   resolve(__dirname, 'recipes/tinginys/index.html'),
                spotifyWidget:     resolve(__dirname, 'spotify-widget/index.html'),
                spotifyCallback:   resolve(__dirname, 'spotify-widget/callback.html'),
                valentinoDiena:    resolve(__dirname, 'valentino-diena/index.html'),
            },
        },
    },
});

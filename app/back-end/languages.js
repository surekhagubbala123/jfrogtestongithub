/*
 * Languages instance
 */

const fs = require('fs-extra');
const path = require('path');
const UtilsHelper = require('./helpers/utils.js');
const languageConfigValidator = require('./helpers/validators/language-config.js');
const normalizePath = require('normalize-path');

class Languages {
    constructor(appInstance) {
        this.basePath = appInstance.appDir;
        this.languagesPath = path.join(this.basePath, 'languages');
        this.appInstance = appInstance;
    }

    /*
     * Load languages from a specific path
     */
    loadLanguages () {
        let pathToLanguages = this.languagesPath;
        let pathToDefaultLanguages = path.join(__dirname, '..', 'default-files', 'default-languages').replace('app.asar', 'app.asar.unpacked');
        let output = [];

        // Load default languages
        let defaultLanguages = fs.readdirSync(pathToDefaultLanguages);

        for(let i = 0; i < defaultLanguages.length; i++) {
            if (defaultLanguages[i][0] === '.' || !UtilsHelper.dirExists(path.join(pathToDefaultLanguages, defaultLanguages[i]))) {
                continue;
            }

            let configPath = path.join(pathToDefaultLanguages, defaultLanguages[i], 'config.json');

            // Load only proper languages
            if (!fs.existsSync(configPath)) {
                continue;
            }

            // Load only properly configured languages
            if(languageConfigValidator(configPath) !== true) {
                continue;
            }

            let languageData = fs.readFileSync(configPath, 'utf8');
            languageData = JSON.parse(languageData);

            output.push({
                type: 'default',
                directory: defaultLanguages[i],
                name: languageData.name,
                version: languageData.version,
                author: languageData.author,
                publiiSupport: languageData.publiiSupport
            });
        }

        // Load additional languages
        let filesAndDirs = fs.readdirSync(pathToLanguages);

        for(let i = 0; i < filesAndDirs.length; i++) {
            if (filesAndDirs[i][0] === '.' || !UtilsHelper.dirExists(path.join(pathToLanguages, filesAndDirs[i]))) {
                continue;
            }

            let configPath = path.join(pathToLanguages, filesAndDirs[i], 'config.json');

            // Load only proper languages
            if (!fs.existsSync(configPath)) {
                continue;
            }

            // Load only properly configured languages
            if(languageConfigValidator(configPath) !== true) {
                continue;
            }

            let languageData = fs.readFileSync(configPath, 'utf8');
            languageData = JSON.parse(languageData);

            output.push({
                type: 'installed',
                directory: filesAndDirs[i],
                name: languageData.name,
                version: languageData.version,
                author: languageData.author,
                publiiSupport: languageData.publiiSupport
            });
        }

        return output;
    }

    /*
     * Remove specific language from the app directory
     */
    removeLanguage(directory) {
        fs.removeSync(path.join(this.languagesPath, directory));
    }

    /*
     * Fixes path for the media file
     */
    normalizeLanguageImagePath(imagePath) {
        // Save the image if necessary
        imagePath = normalizePath(imagePath);
        imagePath = imagePath.replace('file:/', '');

        return imagePath;
    }

    /**
     * Load translations
     */
    loadTranslations (languageName = 'en', type = 'default') {
        let translationsPath = path.join(__dirname, '..', 'default-files', 'default-languages').replace('app.asar', 'app.asar.unpacked');

        if (type !== 'default') {
            translationsPath = this.languagesPath;
        }

        translationsPath = path.join(translationsPath, languageName, 'translations.js');
        return UtilsHelper.requireWithNoCache(translationsPath);
    }
}

module.exports = Languages;

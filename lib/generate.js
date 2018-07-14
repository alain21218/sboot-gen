const { repo, entity, ctrl, prop, swaggerPom, swaggerConfig } = require('./klass');
const chalk = require('chalk');
const fs = require('fs');
const convert = require('xml-js');
const path = require('path');

const createIfNotExist = (targetDir, { isRelativeToScript = false } = {}) => {
    if (fs.existsSync(targetDir)) {
        return;
    }

    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';

    targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }

        return curDir;
    }, initDir);
};

const projectSources = () => {
    const data = fs.readFileSync('./pom.xml');
    const prj = convert.xml2js(data, { compact: true, spaces: 4 }).project;
    const path = `${prj.groupId._text}.${prj.artifactId._text}`;
    const split = path.split('.');
    const fullPath = `src/main/java/${split[0]}/${split[1]}/${split[2]}/`;
    return { path, fullPath };
};

const scafold = () => {
    const src = projectSources();

    createIfNotExist(src.fullPath + 'controller');
    createIfNotExist(src.fullPath + 'entity');
    createIfNotExist(src.fullPath + 'repository');
    createIfNotExist(src.fullPath + 'config');
};

const generateAll = name => {
    generateEntity(name);
    generateRepo(name);
    generateRest(name);
};

const generateRepo = name => {
    scafold();

    const src = projectSources();
    const url = `${src.fullPath}/repository/${name.capitalize()}Repository.java`;

    fs.writeFile(url, repo(name, src.path), err => {
        if (err) throw err;
        display('Repository created in ' + src.path);
    });
};

const generateEntity = name => {
    scafold();

    const src = projectSources();
    const url = `${src.fullPath}/entity/${name.capitalize()}.java`;

    fs.writeFile(url, entity(name, src.path), err => {
        if (err) throw err;
        display('Entiy created in ' + src.path);
    });
};

const generateRest = name => {
    scafold();

    const src = projectSources();
    const url = `${src.fullPath}/controller/${name.capitalize()}Controller.java`;

    fs.writeFile(url, ctrl(name, src.path), err => {
        if (err) throw err;
        display('Rest controller created in ' + src.path);
    });
};

const generateProperties = () => {
    const url = 'src/main/resources/application.properties';

    fs.appendFile(url, '\r\n' + prop(), err => {
        if (err) throw err;
        display('Properties updated');
    });
};

const importSwagger = () => {
    fs.readFile('./pom.xml', (err, data) => {
        if (err) throw err;

        const pom = convert.xml2js(data, { compact: true, spaces: 4 });
        pom.project.dependencies.dependency.push(...swaggerPom());

        fs.writeFile(`./pom.xml`, convert.js2xml(pom, { compact: true, spaces: 4 }), err => {
            if (err) throw err;

            createSwaggerConfig().then(display);
            display('pom.xml updated');
        });
    });
};

const createSwaggerConfig = () => {
    return new Promise((resolve) => {
        scafold();

        const src = projectSources();
        const url = `${src.fullPath}/SwaggerConfig.java`;

        fs.writeFile(url, swaggerConfig(src.path), err => {
            if (err) throw err;
            resolve('SwaggerConfig.java created in ' + src.path);
        });
    });
};

const init = () => {
    generateProperties();
    importSwagger();
};

const display = text => console.log(chalk.green(text));

module.exports = { generateAll, generateRepo, generateEntity, generateRest, generateProperties, importSwagger, init }
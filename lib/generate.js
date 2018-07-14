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
    return `src/main/java/${split[0]}/${split[1]}/${split[2]}/`;
};

const scafold = () => {
    const sources = projectSources();

    createIfNotExist(sources + 'controller');
    createIfNotExist(sources + 'entity');
    createIfNotExist(sources + 'repository');
    createIfNotExist(sources + 'config');
};

const generateAll = name => {
    generateEntity(name);
    generateRepo(name);
    generateRest(name);
};

const generateRepo = name => {
    scafold();

    fs.readFile('./pom.xml', (err, data) => {
        if (err) throw err;

        const prj = convert.xml2js(data, { compact: true, spaces: 4 }).project;
        const path = `${prj.groupId._text}.${prj.artifactId._text}`;
        const split = path.split('.');
        const fullPath = `src/main/java/${split[0]}/${split[1]}/${split[2]}/repository`;

        fs.writeFile(`${fullPath}/${name.capitalize()}Repository.java`, repo(name, path), err => {
            if (err) throw err;
            display('Repository created in ' + path);
        });
    });
};

const generateEntity = name => {
    scafold();

    fs.readFile('./pom.xml', (err, data) => {
        if (err) throw err;

        const prj = convert.xml2js(data, { compact: true, spaces: 4 }).project;
        const path = `${prj.groupId._text}.${prj.artifactId._text}`;
        const split = path.split('.');
        const fullPath = `src/main/java/${split[0]}/${split[1]}/${split[2]}/entity`;

        fs.writeFile(`${fullPath}/${name.capitalize()}.java`, entity(name, path), err => {
            if (err) throw err;
            display('Entiy created in ' + path);
        });
    });
};

const generateRest = name => {
    scafold();
    
    fs.readFile('./pom.xml', (err, data) => {
        if (err) throw err;

        const prj = convert.xml2js(data, { compact: true, spaces: 4 }).project;
        const path = `${prj.groupId._text}.${prj.artifactId._text}`;
        const split = path.split('.');
        const fullPath = `src/main/java/${split[0]}/${split[1]}/${split[2]}/controller`;

        fs.writeFile(`${fullPath}/${name.capitalize()}Controller.java`, ctrl(name, path), err => {
            if (err) throw err;
            display('Rest controller created in ' + path);
        });
    });
};

const generateProperties = () => {
    const root = 'src/main/resources/application.properties';

    fs.appendFile(root, '\r\n' + prop(), err => {
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
    scafold();

    return new Promise((resolve) => {
        fs.readFile('./pom.xml', (err, data) => {
            if (err) throw err;

            const prj = convert.xml2js(data, { compact: true, spaces: 4 }).project;
            const path = `${prj.groupId._text}.${prj.artifactId._text}`;

            const split = path.split('.');
            const fullPath = `src/main/java/${split[0]}/${split[1]}/${split[2]}/config`;

            fs.writeFile(`${fullPath}/SwaggerConfig.java`, swaggerConfig(path), err => {
                if (err) throw err;
                resolve('SwaggerConfig.java created in ' + path);
            });
        });
    });
};

const init = () => {
    generateProperties();
    importSwagger();
};

const display = text => console.log(chalk.green(text));

module.exports = { generateAll, generateRepo, generateEntity, generateRest, generateProperties, importSwagger, init }
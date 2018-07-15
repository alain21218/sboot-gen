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

const projectSources = dir => {
    dir = dir ? '/' + dir : '';
    const data = fs.readFileSync('./pom.xml');
    const prj = convert.xml2js(data, { compact: true, spaces: 4 }).project;
    const package = `${prj.groupId._text}.${prj.artifactId._text}${dir.replaceAll('/', '.')}`;
    const split = package.split('.');
    const path = `src/main/java/${split[0]}/${split[1]}/${split[2]}${dir}/`;

    return { package, path };
};

const splitParams = params => {
    const split = params.split('/');
    return {
        path: split.slice(0, split.length - 1).join('/'),
        name: split[split.length - 1]
    }
};

const generateRepo = input => {
    const params = splitParams(input)
    const src = projectSources(params.path);
    const url = `${src.path}${params.name.capitalize()}Repository.java`;

    createIfNotExist(src.path);

    fs.writeFile(url, repo(params.name, src.path), err => {
        if (err) throw err;
        display('Repository created in ' + src.package);
    });
};

const generateEntity = input => {
    const params = splitParams(input)
    const src = projectSources(params.path);
    const url = `${src.path}${params.name.capitalize()}.java`;

    createIfNotExist(src.path);

    fs.writeFile(url, entity(params.name, src.path), err => {
        if (err) throw err;
        display('Entity created in ' + src.package);
    });
};

const generateRest = input => {
    const params = splitParams(input)
    const src = projectSources(params.path);
    const url = `${src.path}${params.name.capitalize()}Controller.java`;

    createIfNotExist(src.path);

    fs.writeFile(url, ctrl(params.name, src.path), err => {
        if (err) throw err;
        display('Controller created in ' + src.package);
    });
};

const generateProperties = () => {
    const url = 'src/main/resources/application.properties';

    fs.appendFile(url, '\r\n' + prop(), err => {
        if (err) throw err;
        display('Properties updated');
    });
};

const importSwagger = (input = 'config') => {
    fs.readFile('./pom.xml', (err, data) => {
        if (err) throw err;

        const pom = convert.xml2js(data, { compact: true, spaces: 4 });
        pom.project.dependencies.dependency.push(...swaggerPom());

        fs.writeFile(`./pom.xml`, convert.js2xml(pom, { compact: true, spaces: 4 }), err => {
            if (err) throw err;

            createSwaggerConfig(input).then(display);
            display('pom.xml updated');
        });
    });
};

const createSwaggerConfig = input => {
    return new Promise((resolve) => {
        const src = projectSources(input);
        const url = `${src.path}/SwaggerConfig.java`;

        createIfNotExist(src.path);

        fs.writeFile(url, swaggerConfig(src.path), err => {
            if (err) throw err;
            resolve('SwaggerConfig.java created in ' + src.package);
        });
    });
};

const init = () => {
    generateProperties();
    importSwagger();
};

const display = text => console.log(chalk.green(text));

module.exports = { generateRepo, generateEntity, generateRest, generateProperties, importSwagger, init }
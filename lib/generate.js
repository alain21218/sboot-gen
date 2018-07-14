const { repo, entity, ctrl, prop } = require('./klass');
const chalk = require('chalk');
const fs = require('fs');
const parser = require('xml2json');
const path = require('path');

const createIfNotExist = (targetDir, { isRelativeToScript = true } = {}) => {
    if (fs.existsSync(targetDir)){
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
}

const generateAll = name => {
    generateEntity(name);
    generateRepo(name);
    generateRest(name);
}

const generateRepo = name => {
    fs.readFile('./pom.xml', (err, data) => {
        const prj = JSON.parse(parser.toJson(data)).project;
        const path = `${prj.groupId}.${prj.artifactId}`;
        const split = path.split('.');
        const fullPath = `src/main/java/${split[0]}/${split[1]}/${split[2]}/repository`;

        createIfNotExist(fullPath);

        fs.writeFile(`${fullPath}/${name.capitalize()}Repository.java`, repo(name, path), err => {
            if (err) throw err;
            display('Repository created in ' + path);
        });
    });
};

const generateEntity = name => {
    fs.readFile('./pom.xml', (err, data) => {
        const prj = JSON.parse(parser.toJson(data)).project;
        const path = `${prj.groupId}.${prj.artifactId}`;
        const split = path.split('.');
        const fullPath = `src/main/java/${split[0]}/${split[1]}/${split[2]}/entity`;

        createIfNotExist(fullPath);

        fs.writeFile(`${fullPath}/${name.capitalize()}.java`, entity(name, path), err => {
            if (err) throw err;
            display('Entiy created in ' + path);
        });
    });
};

const generateRest = name => {
    fs.readFile('./pom.xml', (err, data) => {
        const prj = JSON.parse(parser.toJson(data)).project;
        const path = `${prj.groupId}.${prj.artifactId}`;
        const split = path.split('.');
        const fullPath = `src/main/java/${split[0]}/${split[1]}/${split[2]}/controller`;

        createIfNotExist(fullPath);

        fs.writeFile(`${fullPath}/${name.capitalize()}Controller.java`, ctrl(name, path), err => {
            if (err) throw err;
            display('Rest controller created in ' + path);
        });
    });
};

const generateProperties = () => {
    const root = 'src/main/resources/application.properties';

    fs.writeFile(root, prop(), err => {
        if (err) throw err;
        display('Properties created');
    });
};

const display = text => console.log(chalk.green(text));

module.exports = { generateAll, generateRepo, generateEntity, generateRest, generateProperties }
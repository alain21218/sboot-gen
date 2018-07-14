const { repo, entity, ctrl } = require('./klass');
const chalk = require('chalk');
const fs = require('fs');
const parser = require('xml2json');
const path = require('path');

const root = 'src/main/java/';

const createIfNotExist = (targetDir, { isRelativeToScript = true } = {}) => {
    if (fs.existsSync(targetDir)) return;

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
    const paramPath = name.path();
    const realName = name.pathFile();

    fs.readFile('./pom.xml', (err, data) => {
        if (err) error(err);
        const prj = JSON.parse(parser.toJson(data)).project;
        const path = `${prj.groupId}.${prj.artifactId}`.split('.');
        const app = `${path[0]}/${path[1]}/${path[2]}/`;
        const dir = app + paramPath;
        const fullPath = root + dir;
        const url = `${fullPath}/${realName.capitalize()}Repository.java`;

        createIfNotExist(fullPath);

        const dirDotted = dir.replaceAll('/', '.');
        const fullPathDotted = fullPath.replaceAll('/', '.');

        fs.writeFile(url, repo(realName, dirDotted, fullPathDotted), err => {
            if (err) error(err);
            else display('Repository created in ' + dirDotted);
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

const display = text => console.log(chalk.green(text));
const error = text => console.log(chalk.red(text));

module.exports = { generateAll, generateRepo, generateEntity, generateRest }
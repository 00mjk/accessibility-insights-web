// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const globby = require('globby');

const identityPath = process.argv[2];
const givenEntitlementsPath = process.argv[3];

function sign(pathToSign, withEntitlements) {
    const entitlements = withEntitlements ? `--entitlements "${givenEntitlementsPath}"` : '';
    console.log(
        `executing: codesign -s ***** --timestamp --force --options runtime ${entitlements} ${pathToSign}`,
    );
    execSync(
        `codesign -s ${identityPath} --timestamp --force --options runtime ${entitlements} "${pathToSign}"`,
        { stdio: 'inherit' },
    );
}

function signAsset(asset, pathToAsset) {
    const fullAssetPath = path.join(pathToAsset, asset);
    sign(fullAssetPath, false);
}

const appLocations = [
    path.resolve('./drop/electron/unified-canary/packed/mac/'),
    path.resolve('./drop/electron/unified-insider/packed/mac/'),
    path.resolve('./drop/electron/unified-production/packed/mac/'),
];

appLocations.forEach(dir => {
    const files = fs.readdirSync(dir);
    const app = files.find(f => path.extname(f) === '.app');
    const frameworksPath = path.join(dir, app, 'Contents/Frameworks');
    const frameworks = globby.sync(`*.framework`, { cwd: frameworksPath, onlyFiles: false });

    frameworks.forEach(fw => {
        const subFWPath = path.join(frameworksPath, fw, 'Versions/A');
        const dyLibs = globby.sync(`Libraries/*.dylib`, { cwd: subFWPath });
        const helpers = globby.sync('Helpers/*', { cwd: subFWPath });

        dyLibs.forEach(lib => signAsset(lib, subFWPath));
        helpers.forEach(helper => signAsset(helper, subFWPath));

        sign(subFWPath, false);
    });

    const subApps = globby.sync(`*.app`, { cwd: frameworksPath, onlyFiles: false });

    subApps.forEach(subAppPath => {
        const appPath = path.join(frameworksPath, subAppPath);
        sign(appPath, true);
    });

    sign(path.join(dir, app), true);
});

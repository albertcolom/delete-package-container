const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    const token = core.getInput('token');
    const octokit = github.getOctokit(token);

    const image = core.getInput('image').split(':');
    const packageName = image[0] || null;
    const packageTag = image[1] || null;

    if (null === packageName || null === packageTag) {
        throw new Error(`The image name "${image}" is invalid. Example format: owner/image_name:tag or image_name:tag`);
    }

    const packages = await octokit.rest.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser({
        package_type: 'container',
        package_name: packageName,
    });

    const packageData = Object.values(packages.data);
    const packageTodDelete = packageData.filter(pkg => {
        return pkg.metadata.container.tags.includes(packageTag);
    });

    const totalPackageTodDelete = packageTodDelete.length;
    core.info(`Found "${totalPackageTodDelete}" package to delete`)

    if (packageData.length === totalPackageTodDelete) {
        octokit.rest.packages.deletePackageForAuthenticatedUser({
            package_type: 'container',
            package_name: packageName,
        });
        return;
    }

    packageTodDelete.forEach(pkg => {
        octokit.rest.packages.deletePackageVersionForAuthenticatedUser({
            package_type: 'container',
            package_name: packageName,
            package_version_id: pkg.id,
        });
    });
}

run().catch(error => core.setFailed(error.message));

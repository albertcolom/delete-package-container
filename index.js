const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    const token = core.getInput('token');
    const octokit = github.getOctokit(token);

    const pkg = core.getInput('package').split(':');
    const packageName = pkg[0] || null;
    const packageTag = pkg[1] || null;

    if (null === packageName || null === packageTag) {
        core.setFailed(`The package name "${pkg} is invalid. Example format: owner/image_name:tag`);
    }

    const packages = await octokit.rest.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser({
        package_type: 'container',
        package_name: packageName,
    });

    const packageData = Object.values(packages.data);

    const packageTodDelete = packageData.filter(pkg => {
        return pkg.metadata.container.tags.includes(packageTag);
    });

    core.info(packageData.length)
    core.info(packageTodDelete.length)

    if (packageData.length === packageTodDelete.length) {
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

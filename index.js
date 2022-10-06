const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    const token = core.getInput('token');
    const octokit = github.getOctokit(token);

    const pkg = core.getInput('package').split(':');
    const packageName = pkg[0] ? pkg[0].replace('/', '%2F') : null;
    const packageTag = pkg[1] || null;

    if (null === packageName || null == packageTag) {
        core.setFailed(`The package name "${pkg} is invalid. Example format: owner/image_name:tag`);
    }

    const packages = await octokit.rest.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser({
        package_type: 'container',
        package_name: packageName,
    });

    Object.values(packages.data).forEach(pkg => {
        if (pkg.metadata.container.tags.includes(packageTag)) {
            octokit.rest.packages.deletePackageVersionForAuthenticatedUser({
                package_type: 'container',
                package_name: packageName,
                package_version_id: pkg.id,
            });
        }
    });
}

run().catch(error => core.setFailed("Workflow failed! " + error.message));

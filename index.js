const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
    const token = core.getInput('token');
    const octokit = github.getOctokit(token);

    const pkg = core.getInput('package').split(':');
    const packageName = pkg[0] || null;
    const packageTag = pkg[1] || null;

    const packages = await octokit.rest.packages.getAllPackageVersionsForPackageOwnedByAuthenticatedUser({
        package_type: 'container',
        package_name: packageName.replace('/', '%2F'),
    });

    Object.values(packages.data).forEach(pkg => {
        console.log('Package ID: '+ pkg.id)
        console.log(pkg.metadata.container.tags)
        console.log(pkg.metadata.container.tags.includes(packageTag))
    });
}

run().catch(error => core.setFailed("Workflow failed! " + error.message));

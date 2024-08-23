import { spawn } from "child_process";
import inquirer from "inquirer";
import chalk from "chalk";

const args = process.argv.slice(2);
const stage = args[0];
const service = args[1];
const region = "us-east-2";

const availableServices = ["api", "core", "db"];

if (!stage) {
  console.log(chalk.red("Please specify the deployment stage (dev or prod)."));
  process.exit(1);
}

if (service && !availableServices.includes(service)) {
  console.log(chalk.red(`Unknown service: ${service}`));
  console.log(
    chalk.red(`Available services are: ${availableServices.join(", ")}`)
  );
  process.exit(1);
}

if (stage === "prod") {
  console.log(chalk.red("-----------------------"));
  console.log(chalk.red("WARNING: PROD DEPLOYMENT"));
  console.log(chalk.red("-----------------------"));

  inquirer
    .prompt([
      {
        type: "input",
        name: "confirmation",
        message: 'Type "PRODUCTION" to confirm deployment:',
      },
    ])
    .then((answers) => {
      if (answers.confirmation === "PRODUCTION") {
        deploySelected(stage, region, service);
      } else {
        console.log(chalk.red("Deployment aborted."));
      }
    });
} else {
  deploySelected(stage, region, service);
}

async function deploySelected(stage, region, selectedService) {
  const servicesToDeploy = selectedService
    ? [selectedService]
    : availableServices;
  const statuses = [];

  for (const service of servicesToDeploy) {
    const status = await deploy(stage, region, service);
    statuses.push({ service, status });
  }

  console.log(chalk.green("\nDeployment Summary:"));
  statuses.forEach(({ service, status }) => {
    if (status === 0) {
      console.log(chalk.green(`${service}: Success`));
    } else {
      console.log(chalk.red(`${service}: Failed with code ${status}`));
    }
  });
}

function deploy(stage, region, service) {
  return new Promise((resolve) => {
    const command = "npx";
    const args = [
      "serverless",
      "deploy",
      "--stage",
      stage,
      "--region",
      region,
      "--verbose",
    ];
    const options = { cwd: service, stdio: "inherit", shell: true };

    console.log(chalk.green(`Deploying ${service}...`));
    console.log(chalk.green("Deployment stage: ", stage));
    console.log(
      chalk.green("Executing command: ", command, args.join(" ")),
      "\n"
    );

    const deployProcess = spawn(command, args, options);

    deployProcess.on("close", (code) => {
      if (code === 0) {
        console.log(
          chalk.green(`${service} deployment completed successfully.`)
        );
      } else {
        console.log(
          chalk.red(`${service} deployment exited with code ${code}`)
        );
      }
      resolve(code);
    });

    deployProcess.on("error", (err) => {
      console.error(
        chalk.red(
          `Failed to start serverless process for ${service}: ${err.message}`
        )
      );
      resolve(1);
    });
  });
}

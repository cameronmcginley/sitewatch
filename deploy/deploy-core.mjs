import { spawn } from "child_process";
import inquirer from "inquirer";
import chalk from "chalk";

const args = process.argv.slice(2);
const stage = args[0];
const region = "us-east-2";

if (!stage) {
  console.log(chalk.red("Please specify the deployment stage (dev or prod)."));
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
        deploy(stage, region);
      } else {
        console.log(chalk.red("Deployment aborted."));
      }
    });
} else {
  deploy(stage, region);
}

function deploy(stage, region) {
  const command = "npm i && npx";
  const args = [
    "serverless",
    "deploy",
    "--stage",
    stage,
    "--region",
    region,
    "--verbose",
  ];
  const options = { cwd: "core", stdio: "inherit", shell: true }; // Set the working directory to 'core'

  console.log(chalk.green("Deploying core..."));
  console.log(chalk.green("Deployment stage: ", stage));
  console.log(
    chalk.green("Executing command: ", command, args.join(" ")),
    "\n"
  );

  const deployProcess = spawn(command, args, options);

  deployProcess.on("close", (code) => {
    if (code === 0) {
      console.log(chalk.green("Deployment script completed successfully."));
    } else {
      console.log(chalk.red(`Deployment process exited with code ${code}`));
    }
  });

  deployProcess.on("error", (err) => {
    console.error(
      chalk.red(`Failed to start serverless process: ${err.message}`)
    );
  });
}

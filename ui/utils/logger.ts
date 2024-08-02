import util from "util";
import chalk from "chalk";

export function prettyLog(label: string, obj: any): void {
  const formattedObj = util.inspect(obj, {
    colors: true,
    depth: null,
    compact: false,
  });

  console.log(`${chalk.bgBlue(new Date().toLocaleString())} : ${chalk.blue(
    label
  )} : ${formattedObj}
    `);
}

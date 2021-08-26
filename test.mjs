#!/usr/bin/env zx

import { statSync } from "fs";

$.shell = "/usr/bin/zsh";
$.quote = function(str) { return str };
$.verbose = false;

// INPUTS
const PNGFILE = "screenshot.png";

const toHuman = (bytes) => Math.round(bytes / 1024) + "KB";

const run = async (title, optimizer, input) => {
  const input_path = `${process.cwd()}/inputs/${input}`;
  const output_path = `${process.cwd()}/outputs/${input.replace(".png", `.${title}.png`)}`;
  const command = optimizer
    .replace("{INPUT}", input_path)
    .replace("{OUTPUT}", output_path);
  
  const time = await $`/usr/bin/time -f "%e" ${command}`;
  const inputSize = statSync(input_path).size;
  const outputSize = statSync(output_path).size;

  const stats = {
    time: Number(time.stderr.toString().trim()),
    inputSize: toHuman(inputSize), 
    outputSize: toHuman(outputSize),
    percentage: 100 - Math.round((outputSize * 100 / inputSize) * 100) / 100
  };

  console.log(title + ": " + stats.time + "s · " + stats.inputSize + " -> " + stats.outputSize + " (" + stats.percentage + "%)");
}

// PNG FILES

run("PNGQUANT", "/usr/bin/pngquant --speed 1 -strip -f {INPUT} -o {OUTPUT}", PNGFILE);
run("OPTIPNG", "optipng -force -o7 {INPUT} -silent -out {OUTPUT}", PNGFILE);

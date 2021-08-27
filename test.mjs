#!/usr/bin/env zx

import { statSync } from "fs";

$.shell = "/usr/bin/zsh";
$.quote = function(str) { return str };
$.verbose = true;

// IMAGE INPUTS
const GIFFILE = "animated.gif";
const APNGFILE = "animated.apng";
const PNGFILE = "lossless.png";
const JPGFILE = "lossy.jpg";
const SVGFILE = "vector.svg";

// Convert bytes to KB
const toHuman = (bytes) => Math.round(bytes / 1024) + "KB";

// Test
const run = async (title, optimizer, input, ext)=> {
  const pos = input.lastIndexOf(".");
  const inputExtension = input.substring(pos+1);
  const outputExtension = ext ?? input.substring(pos+1);
  const optimizerName = title.split(" ")[0];
  const input_path = `./inputs/${input}`;
  const output_path = `./outputs/${input.replace(`.${inputExtension}`, `.${optimizerName}.${outputExtension}`)}`;
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

  console.log(
    title + ": " + 
    stats.time + "s · " + 
    stats.inputSize + " -> " + 
    stats.outputSize + " (" + 
    stats.percentage + "%)"
  );
}

// PNG FILES

run("PNGQUANT (slow=1, -metadata)", "pngquant --speed 1 -strip -f {INPUT} -o {OUTPUT}", PNGFILE);
run("OPTIPNG (very slow=7)", "optipng -force -o7 {INPUT} -silent -out {OUTPUT}", PNGFILE);
run("PNGCRUSH (level 9)", "pngcrush -l 9 -s {INPUT} {OUTPUT}", PNGFILE);
run("PNGNQ (slow=1)", "pngnq -s 1 -e .PNGNQ.png {INPUT} -d outputs", PNGFILE);  // REVISAR
// run("ADVPNG (zlib)", "advpng -z -q -1 
run("PNGOUT (xtreme=0)", "pngout {INPUT} {OUTPUT} -s0 -y -q", PNGFILE);
run("OXIPNG (max)", "oxipng --strip all -q -o max {INPUT} --out {OUTPUT}", PNGFILE);
run("ZOPFLIPNG (normal)", "zopflipng {INPUT} {OUTPUT}", PNGFILE);

// GIF/APNG FILES
run("GIFSICLE (level=3)", "gifsicle -O3 {INPUT} -o {OUTPUT}", GIFFILE);
run("GIF2APNG-ZLIB (zlib)", "gif2apng -z0 {INPUT} {OUTPUT}", GIFFILE, "apng");
run("GIF2APNG-ZOPFLI (zopfli)", "gif2apng -z2 {INPUT} {OUTPUT}", GIFFILE, "apng");
run("APNGOPT", "apngopt {INPUT} {OUTPUT} >/dev/null", APNGFILE);

// JPEG FILES
run("MOZJPEG", "mozjpeg -quality 75 -optimize -progressive -outfile {OUTPUT} {INPUT}", JPGFILE);
run("JPEG-RECOMPRESS", "jpeg-recompress -t 75 -s -Q {INPUT} {OUTPUT}", JPGFILE);
run("JPEGTRAN", "jpegtran -optimize -progressive -outfile {OUTPUT} {INPUT}", JPGFILE);
run("GUETZLI", "guetzli --quality 84 {INPUT} {OUTPUT}", JPGFILE);

// SVG FILES
run("SVGO-basic", "svgo {INPUT} -o {OUTPUT}", SVGFILE);
run("SVGO-p1 (precision=1)", "svgo {INPUT} -p 1 -o {OUTPUT}", SVGFILE);

// NEW GENERATION
// (Skip)

// NEXT GENERATION
run("JPEGXL (JPEG,normal)", "cjxl {INPUT} {OUTPUT} --progressive -q 75", JPGFILE, "jxl");
run("CWEBP-JPG (jpeg-like)", "cwebp -q 75 -quiet -jpeg_like {INPUT} -o {OUTPUT}", JPGFILE, "webp");
run("CWEBP", "cwebp -q 75 -quiet {INPUT} -o {OUTPUT}", JPGFILE, "webp");
run("AVIF-LOSSLESS", "avif --input {INPUT} --output ./outputs --quality 50 --speed 5 --lossless", PNGFILE, "avif");
run("AVIF-LOSSY", "avif --input {INPUT} --output ./outputs --quality 50 --speed 5", JPGFILE, "avif");
run("WEBP2", "cwp2 -q 75 -quiet {INPUT} -o {OUTPUT}", JPGFILE, "webp2");

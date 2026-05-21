import sharp from 'sharp'
import fs from 'fs'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="115" fill="#1d4ed8"/>
  <path d="M156 256 L220 320 L356 192" fill="none" stroke="white" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const svgBuffer = Buffer.from(svg)

await sharp(svgBuffer).resize(192, 192).png().toFile('public/icon-192.png')
console.log('icon-192.png created')

await sharp(svgBuffer).resize(512, 512).png().toFile('public/icon-512.png')
console.log('icon-512.png created')
import sharp from 'sharp';
/** The mark is baked into WebP pixels, rather than a removable HTML overlay. */
export async function watermarkProduct(source:Buffer,width:number){
 const {data,info}=await sharp(source,{limitInputPixels:40_000_000}).rotate().resize({width,withoutEnlargement:true}).toBuffer({resolveWithObject:true});
 const w=info.width,h=info.height,font=w<256?Math.max(4,Math.round(w*.04)):Math.round(w*.024),margin=Math.round(w*.035),labelWidth=Math.round(w*.38),labelHeight=Math.round(font*2.4),label=w<256?'MONA':'MONA · monawear.ir';
 const mark=Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><text x="${w/2}" y="${h*.68}" text-anchor="middle" font-family="Georgia,serif" font-size="${Math.round(w*.09)}" letter-spacing="${Math.round(w*.013)}" fill="#fff" fill-opacity=".28" stroke="#681b2d" stroke-opacity=".13" stroke-width=".7">MONA</text><rect x="${w-margin-labelWidth}" y="${h-margin-labelHeight}" width="${labelWidth}" height="${labelHeight}" rx="${font*.45}" fill="white" fill-opacity=".82"/><text x="${w-margin-labelWidth/2}" y="${h-margin-labelHeight/2+font*.34}" text-anchor="middle" font-family="Georgia,serif" font-size="${font}" fill="#681b2d">${label}</text></svg>`);
 return sharp(data).composite([{input:mark}]).webp({quality:width<=384?76:82,effort:4}).toBuffer();
}

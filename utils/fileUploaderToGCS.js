// const { Storage } = require('@google-cloud/storage');
// const sharp = require('sharp');
// const path = require('path');

// const storage = new Storage({
//     keyFilename: path.join(__dirname, '../config/charming-aegis-452410-g1-72020a196d30.json'),
//     projectId: 'charming-aegis-452410-g1'
// });

// const bucket = storage.bucket('id-user-bucker');

// const uploadToGCS = async (file) => {
//     try {
        
//         const compressedImageBuffer = await sharp(file.buffer)
//             .resize(800, 800, { fit: 'inside' })
//             .jpeg({ quality: 80 })
//             .toBuffer();
//         const fileName = `${Date.now()}-${file.originalname}`;
//         const blob = bucket.file(fileName);
//         const blobStream = blob.createWriteStream({
//             resumable: false,
//             gzip: true
//         });
//         return new Promise((resolve, reject) => {
//             blobStream.on('error', reject);
//             blobStream.on('finish', () => {
//                 const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
//                 resolve({
//                     publicUrl,
//                     fileName: blob.name
//                 });
//             });
//             blobStream.end(compressedImageBuffer);
//             console.log(compressedImageBuffer)
//         });
//     } catch (error) { console.log(error)}
// };
// const generateSignedUrl = async (fileName, expirationMinutes = 60) => {
//     try {
//         const options = {
//             version: 'v4',
//             action: 'read',
//             expires: Date.now() + expirationMinutes * 60 * 1000, // تحويل الدقائق إلى ميلي ثانية
//         };

//         const [url] = await bucket.file(fileName).getSignedUrl(options);
//         return url;
//     } catch (error) {
//         console.error('Error generating signed URL:', error);
//         throw error;
//     }
// };

// module.exports = { uploadToGCS, generateSignedUrl };

const fs = require('fs');
const path = require('path');

const uploadFile = (file, destination) => {
    return new Promise((resolve, reject) => {
        try {
            // التأكد من وجود المجلد المطلوب
            const uploadDir = path.dirname(destination);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            let fileBuffer;

            // التعامل مع أنواع مختلفة من الملفات
            if (file.buffer) {
                // إذا كان الملف buffer (multer memory storage)
                fileBuffer = file.buffer;
            } else if (file.path || file.tempFilePath) {
                // إذا كان الملف محفوظ مؤقتاً
                fileBuffer = fs.readFileSync(file.path || file.tempFilePath);
            } else {
                throw new Error('No valid file data found');
            }

            // حفظ الملف
            fs.writeFileSync(destination, fileBuffer);

            // حذف الملف المؤقت إذا كان موجود
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
                fs.unlinkSync(file.tempFilePath);
            }

            resolve({
                success: true,
                message: 'File uploaded successfully',
                path: destination,
                publicUrl: destination.replace(/\\/g, '/') // للـ URL
            });

        } catch (error) {
            reject({
                success: false,
                message: 'File upload failed',
                error: error.message
            });
        }
    });
};

// Helper function لإنشاء اسم ملف فريد
const generateUniqueFileName = (originalName, mimetype) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);

    // التعامل مع حالات مختلفة للاسم والامتداد
    let extension = '';
    let nameWithoutExt = 'file';

    if (originalName && typeof originalName === 'string' && originalName !== 'blob') {
        extension = path.extname(originalName);
        nameWithoutExt = path.basename(originalName, extension);
    } else if (mimetype) {
        // استخراج الامتداد من mimetype
        const mimeToExt = {
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp'
        };
        extension = mimeToExt[mimetype] || '.jpg';
        nameWithoutExt = 'image';
    } else {
        extension = '.jpg'; // default
    }

    return `${nameWithoutExt}_${timestamp}_${random}${extension}`;
};

// Function محسنة لحفظ الصور مع validation
const uploadImage = async (file, uploadPath = 'uploads/images/') => {
    try {
        console.log('File object:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            hasBuffer: !!file.buffer,
            hasPath: !!file.path
        });

        // التحقق من وجود الملف
        if (!file) {
            throw new Error('No file provided');
        }

        // التحقق من وجود البيانات
        if (!file.buffer && !file.path && !file.tempFilePath) {
            throw new Error('No file data found');
        }

        // التحقق من نوع الملف
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const fileMimetype = file.mimetype || file.type;

        if (!fileMimetype || !allowedTypes.includes(fileMimetype)) {
            throw new Error('Invalid file type. Only images are allowed.');
        }

        // التحقق من حجم الملف (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const fileSize = file.size || file.length || (file.buffer ? file.buffer.length : 0);

        if (fileSize && fileSize > maxSize) {
            throw new Error('File size too large. Maximum 5MB allowed.');
        }

        // إنشاء اسم ملف فريد
        const fileName = file.originalname || file.name || file.filename;
        const uniqueFileName = generateUniqueFileName(fileName, fileMimetype);

        // التأكد من وجود المجلد
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const fullPath = path.join(uploadPath, uniqueFileName);

        // حفظ الملف
        const result = await uploadFile(file, fullPath);

        return {
            ...result,
            fileName: uniqueFileName,
            originalName: fileName || 'unknown',
            size: fileSize || 0,
            mimetype: fileMimetype
        };

    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};
const DeleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject({
                    success: false,
                    message: 'File deletion failed',
                    error: err.message
                });
            } else {
                resolve({
                    success: true,
                    message: 'File deleted successfully'
                });
            }
        });
    });
};

module.exports = {
    uploadFile,
    uploadImage,
    generateUniqueFileName,
    DeleteFile

};

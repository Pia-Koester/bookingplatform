const cloudinary = require("cloudinary");
const fs = require("fs").promises;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const cloudinaryUpload = async (req, res, next) => {
  try {
    const { files } = req;
    const uploadedImages = [];
    for (const file of files.images) {
      const result = await cloudinary.uploader.upload(file.path);

      uploadedImages.push(result);
      await fs.unlink(file.path);
    }

    req.uploadedImages = uploadedImages;

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong");
  }
};

module.exports = {
  cloudinaryUpload,
};

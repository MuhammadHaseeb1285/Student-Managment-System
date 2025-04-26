import './cropImage.css'; // Import the CSS file for styling
export default function getCroppedImg(imageSrc, pixelCrop) {
    const OUTPUT_WIDTH = 200;
    const OUTPUT_HEIGHT = 200;
  
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
  
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT_WIDTH;
        canvas.height = OUTPUT_HEIGHT;
        const ctx = canvas.getContext('2d');
  
        // scale crop area to fit canvas
        const scaleX = OUTPUT_WIDTH / pixelCrop.width;
        const scaleY = OUTPUT_HEIGHT / pixelCrop.height;
        const scale = Math.min(scaleX, scaleY);
  
        const drawWidth = pixelCrop.width * scale;
        const drawHeight = pixelCrop.height * scale;
  
        const offsetX = (OUTPUT_WIDTH - drawWidth) / 2;
        const offsetY = (OUTPUT_HEIGHT - drawHeight) / 2;
  
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight
        );
  
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('Canvas is empty'));
          const fileUrl = URL.createObjectURL(blob);
          resolve(fileUrl);
        }, 'image/jpeg');
      };
  
      image.onerror = error => reject(error);
    });
  }
  
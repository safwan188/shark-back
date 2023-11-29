const PDFDocument = require('pdfkit');
const fs = require('fs');
const { bucket } = require('../googleCloudStorage');
const path = require('path');
const util = require('util');
const streamPipeline = util.promisify(require('stream').pipeline);
const generatePDF = async (report, outputPath) => {
  function reverseWords(str) {
    return str.split(/\s+/).reverse().join(' ');
  }
  
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument();
    let output = fs.createWriteStream(outputPath);
    doc.pipe(output);
    const footerImagePath = './uploads/equipment/footer.png';
    const headerImagePath = './uploads/equipment/header.png';
    const footerImageY = doc.page.height - 60; // Position the footer image 60 units from the bottom of the page

    const hebrewFontPath = './font/arial-hebrew.ttf'; // Adjust the path as needed
    doc.font(hebrewFontPath);
    const titlePart1 = report.index;
    const titlePart2 = ' דוח מס  ';
    
    doc.fillColor('red').text(titlePart1, doc.page.width / 2, 20, { align: 'left' });
    doc.fillColor('black').text(titlePart2, doc.page.width / 2 +10,20, { align: 'left' });
    doc.image(headerImagePath, 50, 30, { width: 500 }); // Adjust positioning and width as needed
    doc.image(footerImagePath,0, doc.page.height - 85, { width:  doc.page.width });
    const tableTop = 150;
    const pageWidth = doc.page.width - 100; // Assuming a margin of 50 on each side
    const column1Width = (pageWidth / 3) * 2; // Left column is 2x bigger than the right one
    const column2Width = pageWidth / 3;
    const column1X = 50;
    const column2X = column1X + column1Width;
    doc.on('pageAdded', () => {
      doc.image(headerImagePath, 50, 30, { width: 500 }); // Adjust positioning and width as needed
      doc.fillColor('red').text(titlePart1, doc.page.width / 2, 20, { align: 'left' });
      doc.fillColor('black').text(titlePart2, doc.page.width / 2 +10,20, { align: 'left' });
      doc.image(footerImagePath, 0, doc.page.height - 85, { width: doc.page.width  });
    });
    // Draw the table
    // Horizontal lines for rows
    for (let i = 0; i <= 8; i++) { // 7 rows + 1 for header
      doc.moveTo(column1X, tableTop + i * 25)
        .lineTo(column1X + column1Width + column2Width, tableTop + i * 25)
        .stroke();
    }
    doc.moveTo(column2X, tableTop + 25) // Start from the second row
    .lineTo(column2X, tableTop + 8 * 25) // 7 rows + 1 for header
    .stroke();
    // Vertical line for columns, starting from the second row (merged cells in the first row)
    doc.moveTo(column2X-column1Width, tableTop ) // Start from the second row
      .lineTo(column2X-column1Width, tableTop + 8 * 25) // 7 rows + 1 for header
      .stroke();

    // Vertical line at the end of the table
    doc.moveTo(column1X + column1Width + column2Width, tableTop)
      .lineTo(column1X + column1Width + column2Width, tableTop + 8 * 25)
      .stroke();
   
    // Add the merged header for the first row
    doc.text(reverseWords(' פרטי הלקוח'), column1X + 10, tableTop + 6, { width: column1Width + column2Width, align: 'center' });
    const columns=[' שם הלקוח',' תאריך הבדיקה'  ,'   כתובת  הנכס  הנבדק '  ,   ' תאריך הנפקת דוח',' עונת הבדיקה',' מאתר מוסמך',' עורך הדוח']
    const exampleDate = new Date();
    const dateString = exampleDate.toLocaleDateString('he-IL'); // Format the date in a Hebrew locale format
    const columnvals = [' ' + report.customer.name + ' ', report.inspectionDate.toLocaleDateString('he-IL'), ' ' + report.property.cityName + ' ', dateString, 'חורף', ' ' + report.expert.name + ' ', ' ' + 'ראיד' + ' '];
    // Add the data
    for (let i = 0; i < 7; i++) {
      let y = tableTop + (i + 1) * 25 + 6;
      doc.text(reverseWords(columnvals[i]), column1X + 10, y, { width: column1Width, align: 'center' });
      doc.text(reverseWords(columns[i]), column2X + 10, y, { width: column2Width, align: 'center' });
    }
    const afterTableY = tableTop + (7 + 1) * 25; // 7 rows of data plus the header

  // Add the additional text
  const additionalText = [
    'במהלך הבדיקה נעזר המאתר במכשור הבא: ',
    'מצלמה סיב אופטי -',
    ' מכשיר שמע לאיתור נזילות - ',
    ' מכשיר גילוי גזים לאיתור נזילות - ',
    ' מכשיר גילוי גזים לאיתור נזילות - ',
    ' פקקי הצפה )פאקרים( -',
   ' מכשיר מד לחות -',  
' מצלמה תרמית אינפרה אדום לאיתור נזילות - ',
' משאבה לבדיקת לחץ ידנית - ',
    ':'
  ];
  const imagePaths = [
    './uploads/equipment/Picture1.jpg', // Replace with actual paths to your images
    './uploads/equipment/Picture2.jpg',
    './uploads/equipment/Picture3.jpg',
    './uploads/equipment/Picture4.jpg',
    './uploads/equipment/Picture5.jpg',
    './uploads/equipment/Picture6.jpg',
    './uploads/equipment/Picture7.jpg',
    './uploads/equipment/Picture8.jpg',

    // ... and so on for each item
  ];
  // Start writing the additional text below the table
  additionalText.forEach((line, index) => {
    let textY = afterTableY + index * 25;
    doc.text(reverseWords(line), column1X, textY, { align: 'right', width: pageWidth }); // leave space for image

    // Check if there is a corresponding image
    
  });
    // Calculate the Y position after the table
    let afterTableYimage = tableTop + (7 + 1) * 25 + 100; // 20 units below the last line of additional text

    // Define the size of the images and the spacing
    const imageSize = 75; // Assuming square images of 50x50
    const imagesPerRow = 4; // We want a 2x2 grid for each square
    const spacingBetweenImages = 25;
    const spacingBetweenSquares = 5; // Space between the 2x2 grids
  
    // Loop through the image paths and place them in a 2x2 grid
    for (let i = 0; i < imagePaths.length; i += imagesPerRow * imagesPerRow) {
      // Each new square (set of 4 images) starts at a new Y position
      let squareY = afterTableYimage + (Math.floor(i / (imagesPerRow * imagesPerRow)) * (imageSize * imagesPerRow + spacingBetweenSquares));
  
      for (let j = 0; j < imagesPerRow * imagesPerRow; j++) {
        // Calculate the position of each image within the square
        let imageX = column1X + (j % imagesPerRow) * (imageSize + spacingBetweenImages);
        let imageY = squareY + Math.floor(j / imagesPerRow) * (imageSize + spacingBetweenImages);
  
        // Check if the image path exists before trying to add it
        if (imagePaths[i + j]) {
          doc.image(imagePaths[i + j], imageX, imageY, { width: imageSize, height: imageSize });
        }
      }
  
      // Update the Y position after drawing each square
      afterTableYimage = squareY + imageSize * imagesPerRow + spacingBetweenSquares;
    }
  
    doc.addPage();
   
    let text = '  חוות דעת של מומחה ';
let textWidth = doc.widthOfString(text);
let textHeight = doc.currentLineHeight();

doc.rect(doc.page.width / 2-textWidth+50, 120 , textWidth , textHeight )
   .fill('red');

doc.fillColor('black')
   .text(reverseWords(text), doc.page.width / 2 - textWidth+50, 120, );
   let yPosition = 150; // This should be calculated based on your last content's Y position

  // const pageWidth = doc.page.width - 100; // Margin of 50 on each side

   // Define the first line with the customer name in the middle
   let firstLineTemplate = ` אני   חותם מטה התבקשתי ע"י חברת  {name} לחוות דעתי המקצועית לגבי כשלים בדירת באתר .`;
   let firstLine = reverseWords(firstLineTemplate.replace('{name}', report.customer.name));
 
   // Measure the width of the preceding text to position the customer name correctly
   let beforeNameWidth = doc.widthOfString(firstLineTemplate.split('{name}')[0]);
 
   // Add the text before the customer name
   doc.fillColor('black')
      .text(reverseWords(firstLineTemplate.split('{name}')[0]), 50, yPosition+10, {continued: true ,width: pageWidth,align: 'right'});
 
   // Calculate the position for the customer name
   let nameXPosition =  beforeNameWidth;
 
   // Add the customer name in red
   doc.fillColor('red')
      .text(reverseWords(' '+report.customer.name+' '),-beforeNameWidth+65,yPosition+10,{continued: true ,width: pageWidth,align: 'right'});
 
   // Add the text after the customer name in black
   doc.fillColor('black')
      .text(reverseWords(firstLineTemplate.split('{name}')[1]), -beforeNameWidth,yPosition+10,{ continued: false ,width: pageWidth ,align: 'right'});
 
   // Increment yPosition for the next block of text
   yPosition += doc.currentLineHeight() + 10;
  // Increment yPosition for the next block of text

   let additionalTextLines = [
    ' אני נותן חוות דעתי זו במקום עדות בבית משפט ואני מצהיר בזאת כי ידוע לי היטב שלעניין הוראת ',
    ' החוק הפלילי בדבר עדות שקר בשבועה בבית המשפט. דין חוות הדעת זו כשהיא חתומה על ידי -כדין ',
    ' עדות בשבועה שנתתי בבימ"ש . ',
    ' חוות הדעת נערכה לפי מיטב ידיעתי והכשרתי המקצועית, ומתוך אמונה כי העובדות שהובאו בחוות ',
    ' הדעת הינן אמת והמסקנות שהבענו נכונות הן . ',
    ' יש לציין כי כל הנתונים והממצאים המפורטים בדו"ח להלן תקפים אך ורק לתאריך בו בוצעה הבדיקה ',
    ' ואין אנו נושאים באחריות לכשלים המתגלים לאחר זמן הבדיקה בעקבות בלאי טבעי או כשלים נוספים ',
    ' שמתרחשים לאחר זמן הבדיקה . '
  ];

  // Starting Y position for the additional text lines

  // Add each line of the additional text
  additionalTextLines.forEach(line => {
    // Check the space remaining on the page
    if (yPosition >= doc.page.height - 50) { // 50 is the bottom margin
      doc.addPage(); // Add a new page
      yPosition = 50; // Reset yPosition to the top of the new page
    }

    // Add the line of text
    doc.text(reverseWords(line), 50, yPosition, { width: pageWidth, align: 'right' });

    // Increment yPosition for the next line
    yPosition += doc.currentLineHeight() + 10; // 10 is the line spacing; adjust as needed
  });

  // Add the education section

  if (report.expert && Array.isArray(report.expert.education)) {
    doc.fontSize(15);
    doc.text(reverseWords('  השכלה והסמכה של המאתר: '), 50, yPosition, { width: pageWidth, align: 'right' });
    yPosition += doc.currentLineHeight() + 15; // adding some space between education entries
    doc.fontSize(12);
    report.expert.education.forEach(educationItem => {
      // Check if the current education item will fit on the page
      let textHeight = doc.heightOfString(educationItem, { width: pageWidth });
  
      // If the text won't fit on the current page, add a new page
      if (yPosition + textHeight > doc.page.height - 50) { // assuming a bottom margin of 50
        doc.addPage();
        yPosition = 50; // reset yPosition to the top margin of the new page
      }
  
      // Add the education item
      doc.text(reverseWords(' '+educationItem+' '), 50, yPosition, { width: pageWidth, align: 'right' ,});
  
      // Increment the yPosition for the next potential item
      yPosition += textHeight + 10; // adding some space between education entries
    });
  } else {
    // Handle the case where report.expert.education is not an array
    console.error('report.expert.education is not defined or is not an array');
  }

  if (report.expert && Array.isArray(report.expert.experience)) {
    doc.fontSize(15);
    doc.text(reverseWords('  ניסיון מקצועי של  המאתר: '), 50, yPosition, { width: pageWidth, align: 'right' });
    yPosition += doc.currentLineHeight() + 15; // adding some space between education entries
    doc.fontSize(12);
    report.expert.experience.forEach(experienceItem => {
      // Check if the current education item will fit on the page
      let textHeight = doc.heightOfString(experienceItem, { width: pageWidth });
  
      // If the text won't fit on the current page, add a new page
      if (yPosition + textHeight > doc.page.height - 50) { // assuming a bottom margin of 50
        doc.addPage();
        yPosition = 50; // reset yPosition to the top margin of the new page
      }
  
      // Add the education item
      doc.text(reverseWords('  '+experienceItem), 50, yPosition, { width: pageWidth, align: 'right' });
  
      // Increment the yPosition for the next potential item
      yPosition += textHeight + 10; // adding some space between education entries
    });
  } else {
    // Handle the case where report.expert.education is not an array
    console.error('report.expert.education is not defined or is not an array');
  }
  if (report.findings && Array.isArray(report.findings)) {
    doc.fontSize(15);
    doc.text(reverseWords('  ממצאי הבדיקה: '), 50, yPosition, { width: pageWidth, align: 'right' });
    yPosition += doc.currentLineHeight() + 15; // adding some space between education entries
    doc.fontSize(12);
    report.findings.forEach(findingsItem => {
      // Check if the current education item will fit on the page
      let textHeight = doc.heightOfString(findingsItem, { width: pageWidth });
  
      // If the text won't fit on the current page, add a new page
      if (yPosition + textHeight > doc.page.height - 50) { // assuming a bottom margin of 50
        doc.addPage();
        yPosition = 50; // reset yPosition to the top margin of the new page
      }
  
      // Add the education item
      doc.text(reverseWords('  '+findingsItem), 50, yPosition, { width: pageWidth, align: 'right' });
  
      // Increment the yPosition for the next potential item
      yPosition += textHeight + 10; // adding some space between education entries
    });
  } else {
    // Handle the case where report.expert.education is not an array
    console.error('report.expert.education is not defined or is not an array');
  }
    
     // Define the size of the images and the spacing for the grid
  const imageSize2 = (doc.page.width - 50) / 2; // Two images per row, 50 units margin on each side
  const imageSpacing =20; // Space between images and from the edges of the page

  // Ensure that report.findingsPhotos is defined and is an array
  if (Array.isArray(report.findingsPhotos)) {
    for (let i = 0; i < report.findingsPhotos.length; i += 4) {
      doc.addPage();

      const positions = [
        { x: imageSpacing, y: imageSpacing + 100 },
        { x: doc.page.width / 2, y: imageSpacing + 100 },
        { x: imageSpacing, y: doc.page.height / 2 },
        { x: doc.page.width / 2, y: doc.page.height / 2 }
      ];

      for (let j = 0; j < 4; j++) {
        if (i + j < report.findingsPhotos.length) {
          const photoPath = report.findingsPhotos[i + j];
          const file = bucket.file(photoPath);
          const localFilePath ='./uploads/findingsPhotos/'+ photoPath; // Adjust the path as needed

          try {
              await streamPipeline(file.createReadStream(), fs.createWriteStream(localFilePath));
              const position = positions[j];
              doc.image(localFilePath, position.x, position.y, { width: imageSize2, height: imageSize2 });
          } catch (error) {
              console.error(`Error downloading image from Google Cloud Storage: ${photoPath}, Error: ${error}`);
          }
        }
      }
    }
} else {
    console.error('report.findingsPhotos is not defined or is not an array');
}

    
    doc.end();
    output.on('finish', function() {
      resolve(outputPath);
    });

    output.on('error', function(err) {
      reject(err);
    });
  });
};

module.exports = {
  generatePDF
};

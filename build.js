const fs = require('fs');
const path = require('path');

const lessonMarkdownPath = path.join(__dirname, 'src', 'lesson.md');
const templateHtmlPath = path.join(__dirname, 'src', 'index.html'); // Using the existing index.html as a template
const outputPath = path.join(__dirname, 'dist', 'index.html');

// Read the lesson plan Markdown
const lessonMarkdown = fs.readFileSync(lessonMarkdownPath, 'utf8');

// Read the Reveal.js template HTML
let templateHtml = fs.readFileSync(templateHtmlPath, 'utf8');

// Split markdown into slides
const slides = lessonMarkdown.split('---').map(slide => slide.trim());

let slidesHtml = '';
slides.forEach(slideContent => {
    let processedSlideContent = slideContent;

    // Process YouTube embeds
    processedSlideContent = processedSlideContent.replace(/{{youtube:([a-zA-Z0-9_-]+)}}/g, (match, videoId) => {
        return `<div class="r-stretch"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
    });

    // Process Google Drive Audio embeds
    processedSlideContent = processedSlideContent.replace(/{{gdrive_audio:([a-zA-Z0-9_-]+)}}/g, (match, fileId) => {
        // Google Drive audio embed requires a specific URL format
        return `<div class="r-stretch"><iframe frameborder="0" width="100%" height="100%" src="https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false&delayms=3000"></iframe></div>`;
    });

    // Process Pixabay Image embeds (for now, just a placeholder)
    processedSlideContent = processedSlideContent.replace(/{{pixabay_image:([^}]+)}}/g, (match, searchTerm) => {
        return `<img src="https://via.placeholder.com/800x450?text=Pixabay+Image:+${encodeURIComponent(searchTerm)}" alt="${searchTerm} image">`;
    });

    // Convert basic markdown to HTML (very basic for now, just paragraphs and headings)
    // This is a very rudimentary conversion. A proper markdown parser would be needed for full support.
    processedSlideContent = processedSlideContent.split('\n').map(line => {
        if (line.startsWith('# ')) {
            return `<h1>${line.substring(2)}</h1>`;
        } else if (line.startsWith('## ')) {
            return `<h2>${line.substring(3)}</h2>`;
        } else if (line.startsWith('### ')) {
            return `<h3>${line.substring(4)}</h3>`;
        } else if (line.trim() !== '') {
            return `<p>${line}</p>`;
        }
        return '';
    }).join('\n');


    slidesHtml += `<section>${processedSlideContent}</section>\n`;
});

// Inject the generated slides into the template HTML
templateHtml = templateHtml.replace(
    '<div class="slides">\n\t\t\t\t<section><h1>Hello LessonSlides!</h1></section>\n\t\t\t\t<section>\n\t\t\t\t\t<h2>This is your first slide.</h2>\n\t\t\t\t\t<p>Press the right arrow to continue.</p>\n\t\t\t\t</section>\n\t\t\t</div>',
    `<div class="slides">\n${slidesHtml}\t\t\t</div>`
);


// Write the final HTML to the dist directory
fs.writeFileSync(outputPath, templateHtml, 'utf8');

console.log('Presentation generated successfully at:', outputPath);

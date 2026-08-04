---
pubDatetime: 2018-06-25T00:00:00.000Z
title: Thumbnail images from MS Office files using PHP and LibreOffice
description: Generate thumbnail images from Microsoft Office files by converting them to PDF with LibreOffice and using Imagick in PHP.
tags:
  - PHP
  - Imagick
  - Thumbnail
  - MS Office
  - PDF
canonicalURL: https://medium.com/@nuwan407/generating-thumbnail-images-from-microsoft-office-files-using-php-and-libreoffice-3decb8f3d8d2
---

In a recent client project, I had to find a way generate thumbnail images from user uploaded Microsoft Office files. Unfortunately, I couldn't find a direct approach to do so but finally I founded an indirect approach which is to convert the Office files into PDF format and then generate thumbnail images using `Imagick` php extension. For this task of converting Office files into PDF, I used the headless mode of LibreOffice. By the way I have done this and tested only on a Linux server (A Debian server to be exact) and I haven't tested this on a Windows server. So I assume you are running the below code in a Linux machine. Okay lets get into coding.

To use this method you will need Imagick and LibreOffice. Let's install them first if you haven't already.

```bash
apt-get install libreoffice
apt-get install php-imagick
```

You may need to run the above commands as the `sudo` user.

## Converting office files to PDF

We will execute a shell command to do the conversion. But we need to prepare the command before that. To do that, first we have to extract the file extension of the uploaded file. Because the command will depend it. We can extract the file extension from the file name using the below function.

```php
$ext = pathinfo($file_name, PATHINFO_EXTENSION);
```

Now we can build the shell command. Here I am using a `switch` statement to build the command according to the file extension.

```php
switch ($ext) {
    case 'doc':
    case 'docx':
        $command = "libreoffice --headless --convert-to pdf --outdir . '$file_name'";
        break;
    case 'ppt':
    case 'pptx':
        $command = "libreoffice --headless --convert-to pdf --outdir . '$file_name'";
        break;
    case 'xls':
    case 'xlsx':
        $command = "libreoffice --headless --convert-to pdf --outdir . '$file_name'";
        break;
    default:
        // handle unsupported file types
        break;
}
```

Here the `--outdir` is the directory where the converted file has to be saved. In this case it is the current directory. The last parameter is the source file which we want to convert, like an user uploaded file. Also it is important to have those apostrophes around the file names. For example in the future if you use a variable to specify the file name, that might contain white spaces and won't execute the shell command successfully. So we must encapsulate the file name with apostrophes.

Now we can execute the command.

```php
shell_exec($command);
```

## Generating the thumbnail image from the pdf file

Now we can convert the converted pdf file into an image format using Imagick.

```php
$pdfFileName = pathinfo($file_name, PATHINFO_FILENAME) . '.pdf';
$thumbnailName = pathinfo($file_name, PATHINFO_FILENAME) . '.jpg';

$im = new Imagick($pdfFileName);
$im->setImageFormat('jpg');
$im->writeImage($thumbnailName);
$im->clear();
```

We have to provide the converted PDF file name to the `readImage` function. Here I convert the PDF into `jpg` format. And voila! We have successfully generated an image thumbnail from a Microsoft Office file. We can further improve this approach and create a library where we can just return a thumbnail image from any given supported file. Also you may want to clean up the converted PDF files if you think that you won't use them in the future. This is just a starting step. In the future I might create a library and publish in Github. For now you can further modify this method to fit your requirements.

Until next time, Happy Coding!
